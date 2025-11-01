import '../checkNodeVersion'
import {
  Compilation,
  Configuration,
  container,
  WebpackPluginInstance,
} from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import { pluginAssetRoute } from '@jcoreio/clarity-plugin-api'
import { AssetsSchema } from './AssetsSchema'
import getProject from '../getProject'

const { ModuleFederationPlugin } = container

export async function makeWebpackConfig(
  env: { [name in string]?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argv: { [name in string]?: unknown }
): Promise<Configuration[]> {
  const {
    projectDir,
    packageJson,
    clientAssetsFile,
    distClientDir,
    emptyEntryFile,
    devOutClientDir,
  } = await getProject()

  const context = projectDir

  function sharedVersions(
    ...modules: string[]
  ): ConstructorParameters<typeof ModuleFederationPlugin>[0]['shared'] & any[] {
    const result: ConstructorParameters<
      typeof ModuleFederationPlugin
    >[0]['shared'] & {} = {}
    for (const mod of modules) {
      const pkg = /^(@[^/]+\/)?[^@/]+/.exec(mod)?.[0] || mod
      const spec = packageJson.dependencies[pkg]
      let requiredVersion = spec
      // if the package was installed as a tarball, try to extract the version from the filename,
      // so that we can install @jcoreio/clarity-plugin-* as tarballs in Clarity to test changes
      // before releasing them
      if (/\.tgz$/.test(spec)) {
        // semver regex copied from semver webpabge, without leading/trailing ^ $
        const semverRx =
          /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/
        requiredVersion =
          semverRx.exec(path.basename(spec.replace(/^file:/, '')))?.[0] || spec
      }
      if (!requiredVersion) continue
      result[mod] = {
        requiredVersion,
        singleton: true,
      }
    }
    return [result]
  }

  const containerName =
    '__clarity_plugin__' +
    packageJson.name.replace(/^@([^/]+)\//, '_$1_').replace(/[^_a-z0-9]+/g, '_')
  const client = packageJson.clarity?.client

  const configs: Configuration[] = []

  const rules = (options: { targets?: string | { node: number | string } }) => {
    const presetEnv = [require.resolve('@babel/preset-env'), options]
    return [
      { test: /\.txt$/, type: 'asset/source' },
      { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/, type: 'asset' },
      { test: /\.(eot|ttf|wav|mp3)$/, type: 'asset/resource' },
      {
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      },
      {
        test: /\.[cm]?jsx?$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: {
          presets: [presetEnv, require.resolve('@babel/preset-react')],
        },
      },
      {
        test: /\.[cm]?ts$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: {
          presets: [
            presetEnv,
            [
              require.resolve('@babel/preset-typescript'),
              { isTSX: false, allowDeclareFields: true },
            ],
          ],
        },
      },
      {
        test: /\.[cm]?tsx$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: {
          presets: [
            presetEnv,
            [
              require.resolve('@babel/preset-typescript'),
              {
                isTSX: true,
                allExtensions: true,
                allowDeclareFields: true,
              },
            ],
            require.resolve('@babel/preset-react'),
          ],
        },
      },
    ]
  }

  const extensions = [
    '.mtsx',
    '.ctsx',
    '.tsx',
    '.mts',
    '.cts',
    '.ts',
    '.mjsx',
    '.cjsx',
    '.jsx',
    '.mjs',
    '.cjs',
    '.js',
    '.wasm',
  ]

  const writeAssetsPlugin: WebpackPluginInstance = {
    apply(compiler) {
      compiler.hooks.beforeCompile.tapPromise(
        'createPluginEntrypoint',
        async () => {
          await fs.mkdirs(path.resolve(context, path.dirname(emptyEntryFile)))
          await fs.writeFile(path.resolve(context, emptyEntryFile), '', 'utf8')
        }
      )
      compiler.hooks.afterEmit.tapAsync(
        { name: 'writePluginAssets' },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (compilation: Compilation, callback) => {
          const entrypoint = compilation.entrypoints.get(containerName)
          if (!entrypoint)
            throw new Error(
              `failed to get webpack entrypoint for ${containerName}`
            )
          const entryChunks = entrypoint.chunks
          const chunks = [
            ...new Set(
              entryChunks.flatMap((c) => [...c.getAllReferencedChunks()])
            ),
          ]
          const { outputPath } = compilation
            .getStats()
            .toJson({ outputPath: true })
          if (!outputPath) throw new Error(`failed to get webpack outputPath`)

          const entrypoints = new Set(
            entryChunks.flatMap((chunk) => [...chunk.files])
          )
          const otherAssets = [
            ...chunks.flatMap((chunk) => [...chunk.files]),
          ].filter((file) => !entrypoints.has(file))

          await fs.mkdirs(path.dirname(clientAssetsFile))
          await fs.writeJson(
            clientAssetsFile,
            AssetsSchema.parse({
              outputPath: path.relative(
                path.dirname(clientAssetsFile),
                outputPath
              ),
              entrypoints: [...entrypoints],
              otherAssets: [...otherAssets],
            }),
            { spaces: 2 }
          )
          callback()
        }
      )
    },
  }

  if (client?.entrypoints) {
    configs.push({
      name: 'client',
      entry: client.entrypoints,
      context,
      mode: env.production ? 'production' : 'development',
      output: {
        clean: true,
        path: env.CLARITY_PLUGIN_TOOLKIT_DEV ? devOutClientDir : distClientDir,
        // this has to match the route that the webapp will serve the generated
        // assets from
        publicPath: pluginAssetRoute
          .format({
            plugin: packageJson.name,
            version: packageJson.version,
            environment: 'client',
            filename: 'f',
          })
          .replace(/f$/, ''),
        filename: `[id]_[fullhash].js`,
      },
      resolve: {
        fallback: {
          assert: require.resolve('assert/'),
          path: require.resolve('path-browserify'),
          process: require.resolve('process/browser'),
        },
        extensions,
        extensionAlias: {
          '.js': ['.tsx', '.ts', '.js'],
          '.mjs': ['.mtsx', '.mts', '.mjs'],
        },
      },
      module: { rules: rules({ targets: '> 0.25%, not dead' }) },
      plugins: [
        writeAssetsPlugin,
        new ModuleFederationPlugin({
          // when the entry script is run it will set window[name] to the module federation container
          name: containerName,
          filename: env.WEBPACK_WATCH ? `entry_[fullhash].js` : 'entry.js',
          // this allows the app code to get the plugin module out of the container
          exposes: {
            '.': client.entrypoints,
          },
          shared: sharedVersions('react', '@jcoreio/clarity-plugin-api/client'),
        }),
      ],
    })
  }

  return configs
}
