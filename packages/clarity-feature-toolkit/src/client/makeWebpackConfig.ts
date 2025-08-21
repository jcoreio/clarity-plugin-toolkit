import '../checkNodeVersion'
import {
  Compilation,
  Configuration,
  container,
  WebpackPluginInstance,
} from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import {
  clientAssetsFile,
  serverAssetsFile,
  distDir,
  emptyEntryFile,
} from '../constants'
import { customFeatureAssetRoute } from '@jcoreio/clarity-feature-api'
import { AssetsSchema } from '../AssetsSchema'
import getProject from '../getProject'
const { ModuleFederationPlugin } = container

export async function makeWebpackConfig(
  env: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argv: Record<string, unknown>
): Promise<Configuration[]> {
  const { projectDir, packageJson } = await getProject()

  const context = projectDir

  const reactVersion = packageJson.dependencies.react
  const clarityFeatureApiVersion =
    packageJson.dependencies['@jcoreio/clarity-feature-api']

  const containerName =
    '__clarity_feature__' +
    packageJson.name.replace(/^@([^/]+)\//, '_$1_').replace(/[^_a-z0-9]+/g, '_')
  const { contributes } = packageJson

  const presetEnv = ['@babel/preset-env', { targets: '> 0.25%, not dead' }]
  const configs: Configuration[] = []

  const rules = [
    { test: /\.json$/, loader: require.resolve('json-loader') },
    { test: /\.txt$/, type: 'asset/source' },
    { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/, type: 'asset' },
    { test: /\.(eot|ttf|wav|mp3)$/, type: 'asset/resource' },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] },
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
    '.json',
    '.wasm',
  ]

  const writeAssetsPlugin: WebpackPluginInstance = {
    apply(compiler) {
      compiler.hooks.afterEmit.tapAsync(
        { name: 'writeFeatureAssets' },
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
          const { outputPath, name } = compilation
            .getStats()
            .toJson({ outputPath: true })
          if (!outputPath) throw new Error(`failed to get webpack outputPath`)

          const entrypoints = new Set(
            entryChunks.flatMap((chunk) => [...chunk.files])
          )
          const otherAssets = [
            ...chunks.flatMap((chunk) => [...chunk.files]),
          ].filter((file) => !entrypoints.has(file))

          const destFile = path.resolve(
            context,
            name === 'server' ? serverAssetsFile : clientAssetsFile
          )
          await fs.mkdirs(path.dirname(destFile))
          await fs.writeJson(
            destFile,
            AssetsSchema.parse({
              outputPath: path.relative(path.dirname(destFile), outputPath),
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

  if (contributes.client) {
    const outputPath = path.resolve(context, distDir, 'client')

    configs.push({
      name: 'client',
      // use a nonexistent entry to avoid making unnecessary chunks;
      // we will ignore webpack errors from this
      entry: emptyEntryFile,
      context,
      mode: env.production ? 'production' : 'development',
      output: {
        clean: true,
        path: outputPath,
        // this has to match the route that the webapp will serve the generated
        // assets from
        publicPath: customFeatureAssetRoute
          .format({
            feature: packageJson.name,
            version: packageJson.version,
            environment: 'client',
            filename: 'f',
          })
          .replace(/f$/, ''),
        filename: `[id]_[hash].js`,
      },
      resolve: {
        fallback: {
          assert: require.resolve('assert/'),
          path: require.resolve('path-browserify'),
          process: require.resolve('process/browser'),
        },
        extensions,
      },
      module: { rules },
      plugins: [
        writeAssetsPlugin,
        new ModuleFederationPlugin({
          // when the entry script is run it will set window[name] to the module federation container
          name: containerName,
          filename: `entry.js`,
          // this allows the app code to get the custom feature module out of the container
          exposes: {
            '.': contributes.client,
          },
          shared: [
            {
              ...(reactVersion ?
                {
                  react: {
                    requiredVersion: reactVersion,
                    singleton: true,
                  },
                }
              : {}),
              ...(clarityFeatureApiVersion ?
                {
                  '@jcoreio/clarity-feature-api/client': {
                    requiredVersion: clarityFeatureApiVersion,
                    singleton: true,
                  },
                }
              : {}),
            },
          ],
        }),
      ],
    })
  }
  if (contributes.server) {
    const outputPath = path.resolve(context, distDir, 'server')

    configs.push({
      name: 'server',
      target: 'node',
      // use a nonexistent entry to avoid making unnecessary chunks;
      // we will ignore webpack errors from this
      entry: emptyEntryFile,
      context,
      mode: env.production ? 'production' : 'development',
      output: {
        clean: true,
        path: outputPath,
        // this has to match the route that the webapp will serve the generated
        // assets from
        publicPath: customFeatureAssetRoute
          .format({
            feature: packageJson.name,
            version: packageJson.version,
            environment: 'server',
            filename: 'f',
          })
          .replace(/f$/, ''),
        filename: `[id]_[hash].js`,
      },
      resolve: { extensions },
      module: { rules },
      plugins: [
        writeAssetsPlugin,
        new ModuleFederationPlugin({
          // when the entry script is run it will set globalThis[name] to the module federation container
          name: containerName,
          filename: `entry.js`,
          // this allows the app code to get the custom feature module out of the container
          exposes: {
            '.': contributes.server,
          },
          shared: [
            {
              ...(reactVersion ?
                {
                  react: {
                    requiredVersion: reactVersion,
                    singleton: true,
                  },
                }
              : {}),
            },
          ],
        }),
      ],
    })
  }
  return configs
}
