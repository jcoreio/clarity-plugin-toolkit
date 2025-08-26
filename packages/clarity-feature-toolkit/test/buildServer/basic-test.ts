import { describe, it } from 'mocha'
import execa from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { buildServer } from '../../src/server/buildServer'
import { distDir, distServerDir } from '../../src/constants'
import { expect } from 'chai'

const fixturesDir = path.resolve(__dirname, '..', '..', '..', '..', 'fixtures')
const fixtureDir = path.resolve(fixturesDir, 'build-server')

describe(`buildServer`, function () {
  it(`basic test`, async function () {
    await fs.remove(path.resolve(fixtureDir, distDir))
    await buildServer({ cwd: fixtureDir })
    await fs.mkdirs(path.resolve(fixtureDir, distDir, 'test'))
    await execa(
      'tar',
      ['xzf', path.join(fixtureDir, distServerDir, 'build-server-0.1.0.tgz')],
      { cwd: path.resolve(fixtureDir, distDir, 'test'), stdio: 'inherit' }
    )
    const mod = await import(
      path.resolve(fixtureDir, distDir, 'test', 'src', 'server', 'index.js')
    )
    const contributions = mod.default()
    expect(contributions.api)
      .to.be.instanceOf(Function)
      .that.has.property('name')
      .that.equals('router')
  })
})
