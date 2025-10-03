import { it } from 'mocha'
import path from 'path'
import fs from 'fs-extra'
import { TemplateOptions } from '../src/templates/TemplateOptions'
import { files } from '../src/templates/files'
import execa from 'execa'
import os from 'os'

const fixtureDir = path.join(
  os.tmpdir(),
  'create-clarity-plugin',
  'test-create'
)

// tricky problems loading webpack.config.ts in CI, argh
;(process.env.CI ? it.skip : it)('typescript', async function () {
  this.timeout(60000)
  await fs.remove(fixtureDir)
  // eslint-disable-next-line no-console
  console.log('fixture dir:', fixtureDir)
  const options: TemplateOptions = {
    name: 'testpkg',
    clarityPluginToolkitDir: '.clarity-plugin-toolkit',
    useToolchain: false,
    toolchainVersion: '',
    useTypescript: true,
    useEslint: true,
    usePrettier: true,
    stubs: [
      'dashboardWidget',
      'expressApi',
      'jsMigrations',
      'organizationView',
      'sidebarItem',
      'sqlMigrations',
    ],
    packageManager: 'pnpm',
  }
  const actual = await files(options)
  for (const [file, content] of Object.entries(actual)) {
    if (!content) continue
    const destFile = path.join(fixtureDir, file)
    await fs.mkdirs(path.dirname(destFile))
    await fs.writeFile(destFile, content, 'utf8')
  }
  const execaOpts: execa.Options = { cwd: fixtureDir, stdio: 'inherit' }
  await execa('pnpm', ['i'], execaOpts)
  await execa('pnpm', ['run', 'format'], execaOpts)
  await execa('pnpm', ['run', 'check'], execaOpts)
  await execa('pnpm', ['run', 'build'], execaOpts)
})
