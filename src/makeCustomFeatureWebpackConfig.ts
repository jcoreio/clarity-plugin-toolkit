import { Configuration, container } from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import { featureEntrypointFile, customFeatureAssetPath } from './constants'
import createFeatureEntrypoint from './createFeatureEntrypoint'
const { ModuleFederationPlugin } = container

export type MakeCustomFeatureWebpackConfigOptions = {
  organizationId: number
  featureId: number
  rootDir: string
  overrides?: Partial<Configuration>
}

export default async function makeCustomFeatureWebpackConfig({
  organizationId,
  featureId,
  rootDir,
  overrides,
}: MakeCustomFeatureWebpackConfigOptions): Promise<Configuration> {
  const packageJson = await fs.readJson(path.join(rootDir, 'package.json'))

  const reactVersion = packageJson.dependencies?.react
  const clarityFeatureApiVersion =
    packageJson.dependencies?.['@jcoreio/clarity-feature-api']

  const presetEnv = ['@babel/preset-env', { targets: '> 0.25%, not dead' }]
  return {
    // use a nonexistent entry to avoid making unnecessary chunks;
    // we will ignore webpack errors from this
    entry: './__clarity_nonexistent_entry__',
    context: rootDir,
    mode: 'development',
    optimization: {
      emitOnErrors: false,
    },
    output: {
      // this has to match the route that the webapp will serve the generated
      // assets from
      publicPath: customFeatureAssetPath.format({ filename: '' }),
      filename: `org${organizationId}_feat${featureId}_[id]_[hash].js`,
    },
    resolve: {
      fallback: {
        assert: require.resolve('assert/'),
        path: require.resolve('path-browserify'),
        process: require.resolve('process/browser'),
      },
      extensions: [
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
      ],
    },
    module: {
      rules: [
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.txt$/, type: 'asset/source' },
        { test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/, type: 'asset' },
        { test: /\.(eot|ttf|wav|mp3)$/, type: 'asset/resource' },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        {
          test: /\.[cm]?jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [presetEnv, '@babel/preset-react'],
          },
        },
        {
          test: /\.[cm]?ts$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              presetEnv,
              [
                '@babel/preset-typescript',
                { isTSX: false, allowDeclareFields: true },
              ],
            ],
          },
        },
        {
          test: /\.[cm]?tsx$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              presetEnv,
              [
                '@babel/preset-typescript',
                { isTSX: true, allExtensions: true, allowDeclareFields: true },
              ],
              '@babel/preset-react',
            ],
          },
        },
      ],
    },
    plugins: [
      {
        apply(compiler) {
          const rootDir = compiler.options?.context
          if (rootDir) {
            compiler.hooks.beforeCompile.tapPromise(
              'createFeatureEntrypoint',
              () => createFeatureEntrypoint({ rootDir })
            )
          }
        },
      },
      new ModuleFederationPlugin({
        // when the entry script is run it will set window[name] to the module federation container
        name: `org${organizationId}_feat${featureId}`,
        filename: `org${organizationId}_feat${featureId}_entry_[hash].js`,
        // this allows the app code to get the custom feature module out of the container
        exposes: {
          '.': featureEntrypointFile,
        },
        shared: [
          {
            ...(reactVersion
              ? {
                  react: {
                    requiredVersion: reactVersion,
                    singleton: true,
                  },
                }
              : {}),
            ...(clarityFeatureApiVersion
              ? {
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
    ...overrides,
  }
}
