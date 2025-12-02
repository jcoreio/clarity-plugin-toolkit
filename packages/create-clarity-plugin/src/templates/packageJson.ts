import { TemplateOptions } from './TemplateOptions'

export function makePackageJson({
  name,
  useToolchain,
  toolchainVersion,
  useTypescript,
  useEslint,
  usePrettier,
  packageManager,
  stubs,
}: TemplateOptions) {
  const checks = []
  if (usePrettier) checks.push('prettier -c .')
  if (useEslint) checks.push('eslint')
  if (useTypescript) checks.push('tsc --noEmit')
  return {
    name,
    version: '0.1.0',
    private: true,
    ...(packageManager === 'pnpm' ?
      { packageManager: 'pnpm@10.9.0' }
    : undefined),
    engines: {
      node: '>=20',
    },
    type: 'module',
    clarity:
      (
        stubs?.includes('dashboardWidget') ||
        stubs?.includes('organizationView') ||
        stubs?.includes('sidebarItem')
      ) ?
        {
          client: {
            entrypoints: [`./src/client/index.${useTypescript ? 'ts' : 'js'}`],
          },
        }
      : undefined,
    exports: {
      './migrate':
        stubs?.includes('jsMigrations') || stubs?.includes('sqlMigrations') ?
          `./src/server/migrate.${useTypescript ? 'ts' : 'js'}`
        : undefined,
      './webapp':
        stubs?.includes('expressApi') ?
          `./src/server/webapp.${useTypescript ? 'ts' : 'js'}`
        : undefined,
    },
    scripts: {
      ...(checks.length ?
        {
          check: checks.join(' && '),
        }
      : {}),
      ...(usePrettier ? { format: 'prettier -w .' } : {}),
      ...(useToolchain ?
        { tc: 'toolchain', toolchain: 'toolchain', test: 'toolchain test' }
      : {}),
      clean: 'clarity-plugin-toolkit clean',
      build: 'clarity-plugin-toolkit build',
      deploy: 'clarity-plugin-toolkit deploy',
      dev: 'clarity-plugin-toolkit dev',
      'clarity-plugin-toolkit': 'clarity-plugin-toolkit',
    },
    dependencies: sortKeys({
      '@jcoreio/clarity-plugin-api': `^1.4.0`,
      react: '^18.2.0',
      ...(stubs?.includes('expressApi') ? { express: '^4.21.2' } : {}),
      ...(stubs?.includes('dashboardWidget') ? { zod: '^3.25.76' } : {}),
    }),
    devDependencies: sortKeys({
      '@jcoreio/clarity-plugin-toolkit': `^1.3.7`,
      webpack: '^5.102.0',
      'webpack-cli': '^6.0.1',
      '@babel/register': '^7.28.3', // needed for TS webpack config
      ...(useToolchain ?
        {
          '@jcoreio/toolchain': toolchainVersion,
          '@jcoreio/toolchain-esnext': toolchainVersion,
          '@jcoreio/toolchain-react': toolchainVersion,
          '@jcoreio/toolchain-typescript': toolchainVersion,
        }
      : {}),
      ...(usePrettier && !useToolchain ? { prettier: '^3.4.2' } : {}),
      ...(useTypescript ?
        {
          '@types/react': '^18.2.0',
          '@types/node': `^20.10.0`,
          typescript: '^5.9.3',
          ...(stubs?.includes('expressApi') ?
            { '@types/express': '^4.17.23' }
          : {}),
        }
      : {}),
      ...(useEslint && !useToolchain ?
        {
          '@eslint/compat': '^1.3.2',
          '@eslint/js': '^9.33.0',
          eslint: '9.36.0',
          'eslint-plugin-react': '^7.37.5',
          globals: '^16.0.0',
          ...(usePrettier ? { 'eslint-config-prettier': '^9.1.0' } : {}),
          ...(useTypescript ?
            {
              'typescript-eslint': '^8.40.0',
            }
          : {}),
        }
      : {}),
    }),
  }
}

function sortKeys<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.keys(obj)
      .sort()
      .map((key) => [key, obj[key as keyof T]])
  ) as T
}
