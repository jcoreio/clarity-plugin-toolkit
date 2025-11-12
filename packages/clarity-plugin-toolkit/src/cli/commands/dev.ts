/* eslint-disable @typescript-eslint/no-misused-promises */
import * as yargs from 'yargs'
import getProject from '../../getProject.ts'
import execa from 'execa'
import emitted from 'p-event'
import express from 'express'
import httpProxy from 'http-proxy'
import WebpackCLI, {
  type IWebpackCLI,
  type WebpackDevServerOptions,
} from 'webpack-cli'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import z from 'zod'
import assert from 'assert'
import { buildWatchServer } from '../../server/buildWatchServer.ts'
import debounce from 'lodash/debounce.js'
import chalk from 'chalk'
import { FSWatcher } from 'chokidar'
import { promisify } from 'util'
import fs from 'fs-extra'
import path from 'path'
import { loginToECR } from '@jcoreio/aws-ecr-utils'
import { setupDockerCompose } from '../../util/setupDockerCompose.ts'
import open from 'open'
import enableDestroy from 'server-destroy'
import { pluginAssetRoute } from '@jcoreio/clarity-plugin-api'
import { AssetsSchema } from '../../client/AssetsSchema.ts'
import {
  withResolvers,
  type PromiseWithResolvers,
} from '../../util/withResolvers.ts'

export const command = 'dev'
export const description = `run plugin in local dev server`

type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 dev')

export async function handler(): Promise<void> {
  const { RewritingStream } = await import('parse5-html-rewriting-stream')
  const { projectDir, packageJson, clientAssetsFile } = await getProject()
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
    ['compose', 'up', '-d', 'db', 'redis', 's3'],
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
  app.use(webpackDevMiddleware(compiler, devMiddlewareConfig))
  app.use(webpackHotMiddleware(compiler))

  let compilePromise = withResolvers<void>()
  compiler.hooks.watchRun.tap(
    { name: 'clarity-plugin-toolkit dev watchRun' },
    () => {
      compilePromise = withResolvers<void>()
    }
  )
  compiler.hooks.done.tap({ name: 'clarity-plugin-toolkit dev done' }, () => {
    compilePromise.resolve()
  })

  const proxy = httpProxy.createProxyServer()
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
      proxy.web(req, res, { target, selfHandleResponse: true })
    })
  )

  proxy.on('proxyRes', async (proxyRes, req, res) => {
    await compilePromise.promise
    const rawAssets = await fs
      .readJson(clientAssetsFile)
      .catch((err: unknown) => {
        res.writeHead(500).end(err instanceof Error ? err.stack : String(err))
        return undefined
      })
    if (!rawAssets) return
    for (const [header, values] of Object.entries(proxyRes.headersDistinct)) {
      if (!values) continue
      if (header === 'content-security-policy') {
        const parts = values.flatMap((value) => value.split(/\s*;\s*/g))
        res.setHeader(
          'content-security-policy',
          parts
            .map((part) =>
              part.startsWith('script-src') ? `${part} 'unsafe-eval'`
              : part.startsWith('connect-src') ? `${part} webpack://*`
              : part
            )
            .join('; ')
        )
        continue
      }
      for (const value of values) res.appendHeader(header, value)
    }
    res.writeHead(proxyRes.statusCode ?? 200)

    const assets = AssetsSchema.parse(rawAssets)
    if (
      /^text\/html(;|$)/.test(proxyRes.headers['content-type'] || '') ||
      (!proxyRes.headers['content-type'] &&
        req.headers.accept?.split(',').includes('text/html'))
    ) {
      const rewriter = new RewritingStream()
      let skipTag = false
      let nonce = ''
      rewriter.on('startTag', (startTag) => {
        if (
          startTag.tagName === 'meta' &&
          startTag.attrs.find(
            (a) => a.name === 'property' && a.value === 'csp-nonce'
          )
        ) {
          nonce = startTag.attrs.find((a) => a.name === 'content')?.value || ''
        }
        if (
          startTag.tagName === 'script' &&
          startTag.attrs
            .find((a) => a.name === 'src')
            ?.value.startsWith(
              pluginAssetRoute
                .partialFormat({ plugin: packageJson.name })
                .replace(/\/:.+/, '')
            )
        ) {
          skipTag = true
          return
        }
        skipTag = false
        rewriter.emitStartTag(startTag)
      })
      rewriter.on('endTag', (endTag) => {
        if (skipTag) {
          skipTag = false
          return
        }
        if (endTag.tagName === 'head') {
          rewriter.emitRaw(
            [...assets.entrypoints]
              .map(
                (filename) =>
                  `<script src="${pluginAssetRoute.format({
                    plugin: packageJson.name,
                    version: packageJson.version,
                    environment: 'client',
                    filename,
                  })}" nonce="${nonce}"></script>`
              )
              .join('')
          )
        }
        rewriter.emitEndTag(endTag)
      })
      proxyRes.setEncoding('utf8').pipe(rewriter).pipe(res)
      return
    }
    proxyRes.pipe(res)
  })

  const server = app.listen(DEV_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Dev server is listening on http://0.0.0.0:${DEV_PORT}`)
  })
  enableDestroy(server)

  server.on(
    'upgrade',
    asyncHandler(async (req, socket, head) => {
      await startup?.promise
      proxy.ws(req, socket, head, { target })
    })
  )

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
        promisify<void>((cb) => server.destroy(cb))(),
        buildWatch?.close(),
        dockerApp ? emitted(dockerApp, 'close') : null,
      ]).catch(() => {})
      dockerApp?.kill()
      await promise
      process.exit(128 + 2)
    })()
  })

  // wait for webpack to compile successfully once before starting
  // the build watch server, because the output package.json will be wrong
  // if the client assets file hasn't been written by webpack
  let compiling = true
  while (compiling) {
    try {
      await compilePromise.promise
      compiling = false
    } catch {
      continue
    }
  }

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
