import { it } from 'mocha'
import { expect } from 'chai'
import path from 'path'
import fs from 'fs-extra'
import { TemplateOptions } from '../src/templates/TemplateOptions'
import { files } from '../src/templates/files'

const fixturesDir = path.join(__dirname, 'fixtures')
const fixtures = fs.readdirSync(fixturesDir)

for (const fixture of fixtures) {
  it(fixture, async function () {
    const fixtureDir = path.join(fixturesDir, fixture)
    const options: TemplateOptions = {
      name: 'testpkg',
      clarityPluginToolkitDir: '.clarity-plugin-toolkit',
      useToolchain: false,
      toolchainVersion: '',
      useTypescript: false,
      useEslint: false,
      usePrettier: false,
      stubs: ['dashboardWidget'],
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ...require(path.join(fixtureDir, '_options.js')),
    }
    const actual = await files(options)
    if (process.env.UPDATE_SNAPSHOTS) {
      for (const [file, content] of Object.entries(actual)) {
        if (!content) continue
        const destFile = path.join(fixtureDir, file)
        await fs.mkdirs(path.dirname(destFile))
        await fs.writeFile(destFile, content, 'utf8')
        // eslint-disable-next-line no-console
        console.log(`wrote ${path.relative(process.cwd(), destFile)}`)
      }
    } else {
      for (const [file, content] of Object.entries(actual)) {
        if (!content) continue
        expect(
          await fs.readFile(path.join(fixtureDir, file), 'utf8'),
          `content of ${file}`
        ).to.equal(content)
      }
    }
  })
}
