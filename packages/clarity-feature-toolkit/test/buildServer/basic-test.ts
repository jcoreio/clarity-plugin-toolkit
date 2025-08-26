import { describe, it } from 'mocha'
import execa from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { buildServer } from '../../src/server/buildServer'
import { paths } from '../../src/paths'
import { expect } from 'chai'

const fixturesDir = path.resolve(__dirname, '..', '..', '..', '..', 'fixtures')
const fixtureDir = path.resolve(fixturesDir, 'build-server')

describe(`buildServer`, function () {
  it(`basic test`, async function () {
    const { distDir, serverTarball } = paths(fixtureDir)
    await fs.remove(distDir)
    await buildServer({ cwd: fixtureDir })
    await fs.mkdirs(path.resolve(distDir, 'test'))
    await execa('tar', ['xzf', serverTarball], {
      cwd: path.resolve(distDir, 'test'),
      stdio: 'inherit',
    })
    const mod = await import(
      path.resolve(distDir, 'test', 'src', 'server', 'index.js')
    )
    const contributions = mod.default()
    expect(contributions.api)
      .to.be.instanceOf(Function)
      .that.has.property('name')
      .that.equals('router')
  })
})
