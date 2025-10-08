import * as yargs from 'yargs'
import getProject from '../../getProject'
import execa from 'execa'
import emitted from 'p-event'
import express from 'express'
import { createProxyServer } from 'http-proxy'
import { withResolvers } from '../../util/withResolvers'
import WebpackCLI, { IWebpackCLI, WebpackDevServerOptions } from 'webpack-cli'
import webpackDevMiddleware from 'webpack-dev-middleware'
import z from 'zod'
import assert from 'assert'
import { buildWatchServer } from '../../server/buildWatchServer'
import { debounce } from 'lodash'
import chalk from 'chalk'
import { FSWatcher } from 'chokidar'
import { promisify } from 'util'
import path from 'path'
import { loginToECR } from '@jcoreio/aws-ecr-utils'
import { setupDockerCompose } from '../../util/setupDockerCompose'
import open from 'open'

export const command = 'dev'
export const description = `run plugin in local dev server`

type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 dev')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  await setupDockerCompose()

  const config = z
    .object({
      services: z.object({
        app: z.object({
          environment: z.record(z.string(), z.string().nullable()),
          ports: z.array(
            z.object({
              mode: z.string(),
              target: z.number(),
              published: z.string(),
              protocol: z.string(),
            })
          ),
        }),
      }),
    })
    .parse(
      JSON.parse(
        (
          await execa('docker', ['compose', 'config', '--format', 'json'], {
            cwd: projectDir,
            stdio: 'pipe',
            maxBuffer: 10 * 1024 * 1024,
          })
        ).stdout
      )
    )

  const startServicesPromise = execa(
    'docker',
    ['compose', 'up', '-d', 'db', 'redis'],
    { stdio: 'inherit' }
  )
  startServicesPromise.catch(() => {})

  const appConfig = config.services.app

  const rawPort = appConfig.ports.find(
    (p) => p.mode === 'ingress' && p.protocol === 'tcp' && p.target === 80
  )?.published
  assert(rawPort)
  const PORT = parseInt(rawPort)
  const { ROOT_URL } = appConfig.environment
  assert(ROOT_URL)
  const DEV_PORT = parseInt(new URL(ROOT_URL).port)

  const app = express()

  // @ts-expect-error webpack-cli type defs for CJS default exports are broken
  const cli: IWebpackCLI = new WebpackCLI()
  const env = {
    WEBPACK_BUILD: true,
    WEBPACK_BUNDLE: true,
    WEBPACK_WATCH: true,
    development: true,
    CLARITY_PLUGIN_TOOLKIT_DEV: true,
  }
  const webpackOptions: Partial<WebpackDevServerOptions> = {
    argv: { env },
  }
  cli.webpack = await cli.loadWebpack(webpackOptions)
  const compiler = await cli.createCompiler(webpackOptions)
  let webpackConfigs = await cli.loadConfig(webpackOptions)
  webpackConfigs = await cli.buildConfig(webpackConfigs, webpackOptions)
  const webpackConfig =
    Array.isArray(webpackConfigs) ? webpackConfigs[0] : webpackConfigs
  const devServerConfig = webpackConfig.devServer || {}
  const devMiddlewareConfig = devServerConfig.devMiddleware || {}
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use(webpackDevMiddleware(compiler, devMiddlewareConfig))

  const proxy = createProxyServer()
  proxy.on('proxyRes', (res) => {
    // add unsafe-eval to CSP script-src so that the browser will load the plugin dev bundle
    if (typeof res.headers['content-security-policy'] === 'string') {
      const parts = res.headers['content-security-policy'].split(/\s*;\s*/g)
      res.headers['content-security-policy'] = parts
        .map((part) =>
          part.startsWith('script-src') ? `${part} 'unsafe-eval'` : part
        )
        .join('; ')
    }
  })
  // eslint-disable-next-line no-console
  proxy.on('error', (err) => console.error(err))

  const target = `http://localhost:${PORT}`

  let startup: PromiseWithResolvers<void> | undefined = withResolvers<void>()

  const asyncHandler =
    <Args extends any[]>(handler: (...args: Args) => Promise<void>) =>
    (...args: Args) =>
      void handler(...args).catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error(err)
      })

  app.all(
    '*',
    asyncHandler(async (req, res) => {
      await startup?.promise
      proxy.web(req, res, { target })
    })
  )

  const server = app.listen(DEV_PORT)

  server.on(
    'upgrade',
    asyncHandler(async (req, socket, head) => {
      await startup?.promise
      proxy.ws(req, socket, head, { target })
    })
  )

  // eslint-disable-next-line no-console
  console.log(`Dev server is listening on http://0.0.0.0:${DEV_PORT}`)

  let openedBrowser = false

  let dockerApp: execa.ExecaChildProcess | undefined

  let lastChangedFile: string | undefined
  async function restartDocker({ login = false }: { login?: boolean } = {}) {
    const restarting = dockerApp != null
    try {
      if (login) await loginToECR({})
      // eslint-disable-next-line no-console
      console.error(
        `${
          restarting ?
            lastChangedFile ?
              `${path.relative(process.cwd(), lastChangedFile)} changed, restarting`
            : 'restarting'
          : 'starting'
        } Clarity docker container...`
      )
      if (!startup) {
        startup = withResolvers<void>()
      }
      if (dockerApp != null) {
        const stoppedPromise = emitted(dockerApp, 'close').catch(() => {})
        dockerApp.kill()
        await stoppedPromise
      }

      await startServicesPromise
      dockerApp = execa('docker', ['compose', 'up', 'app'], {
        stdio: 'pipe',
        cwd: projectDir,
      })
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dockerApp.once('close', () => {
        dockerApp = undefined
      })

      dockerApp.stdout?.pipe(process.stdout)
      dockerApp.stderr?.pipe(process.stderr)

      const watchStdio = (chunk: Buffer | string) => {
        if (!startup) return
        const output = chunk.toString()
        if (output.includes('app] INFO http listening')) {
          startup.resolve()
          startup = undefined

          if (!openedBrowser && ROOT_URL) {
            openedBrowser = true
            const openProc = open(ROOT_URL)
            openProc
              .then((child) => {
                child.unref()
              })
              .catch(() => {})
          }
        }
        if (output.includes('pull access denied') && !login) {
          void restartDocker({ login: true })
        }
      }

      dockerApp.stdout?.on('data', watchStdio)
      dockerApp.stderr?.on('data', watchStdio)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        chalk.red(
          `Failed to ${restarting ? 'restart' : 'start'} Clarity docker container`,
          error
        )
      )
    }
  }

  const handleChange = debounce(restartDocker, 500)

  let buildWatch: FSWatcher | undefined = undefined
  process.on('SIGINT', () => {
    void (async () => {
      const promise = Promise.allSettled([
        promisify<void>((cb) => server.close(cb))(),
        buildWatch?.close(),
        dockerApp ? emitted(dockerApp, 'close') : null,
      ]).catch(() => {})
      dockerApp?.kill()
      await promise
      process.exit(128 + 2)
    })()
  })

  buildWatch = await buildWatchServer({
    devMode: true,
    onChange: (file) => {
      lastChangedFile = file
      void handleChange()
    },
  })

  buildWatch.on('ready', () => {
    void restartDocker()
  })
}
