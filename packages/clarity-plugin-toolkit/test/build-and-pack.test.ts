import { describe, it, beforeEach, afterEach } from 'mocha'
import execa from 'execa'
import fs from 'fs-extra'
import path from 'path'
import * as build from '../src/cli/commands/build'
import * as pack from '../src/cli/commands/pack'
import { expect } from 'chai'
import { getProjectBase } from '../src/getProject'
import setSigningKey from '../src/setSigningKey'
import crypto from 'crypto'
import { pipeline } from 'stream/promises'
import { makeSignaturesFilename } from '@jcoreio/clarity-plugin-api'

const fixturesDir = path.resolve(__dirname, '..', '..', '..', 'fixtures')
const fixtureDir = path.resolve(fixturesDir, 'test-plugin')

describe(`build and pack`, function () {
  let prevCwd = process.cwd()
  beforeEach(() => {
    prevCwd = process.cwd()
  })

  afterEach(() => {
    process.chdir(prevCwd)
  })

  it(`basic test`, async function () {
    this.timeout(60000)
    process.chdir(fixtureDir)
    const { distDir, distTarball } = await getProjectBase(fixtureDir)
    await fs.remove(distDir)

    const modulusLength = 4096
    const algorithm = 'rsa-pss'
    const hashAlgorithm = 'SHA256'

    const { publicKeyObject, privateKeyObject } = await new Promise<{
      publicKeyObject: crypto.KeyObject
      privateKeyObject: crypto.KeyObject
    }>((resolve, reject) => {
      crypto.generateKeyPair(
        algorithm,
        {
          modulusLength,
          hashAlgorithm,
        },
        (err, publicKeyObject, privateKeyObject) => {
          if (err) {
            reject(err)
          } else {
            resolve({ publicKeyObject, privateKeyObject })
          }
        }
      )
    })

    const signatureVerificationKeyId = 2

    const privateKey = Buffer.concat([
      Buffer.alloc(4),
      privateKeyObject.export({ type: 'pkcs8', format: 'der' }),
    ])
    privateKey.writeUint32BE(signatureVerificationKeyId)

    await setSigningKey(privateKey.toString('base64'))
    await build.handler({ env: ['development'] })
    await pack.handler()
    const unpackDir = path.resolve(distDir, 'unpack')
    await fs.mkdirs(unpackDir)
    await execa('tar', ['xzf', distTarball], {
      cwd: unpackDir,
      stdio: 'inherit',
    })
    const packageJson = await fs.readJson(
      path.resolve(unpackDir, 'package', 'package.json')
    )
    expect(packageJson).to.containSubset({
      exports: {
        './webapp': './src/server/index.js',
      },
      clarity: {
        url: 'http://localhost:4010',
        client: {
          entrypoints: ['client/entry.js'],
        },
        signatureVerificationKeyId,
      },
    })
    const signatures = await fs.readJson(
      path.resolve(
        unpackDir,
        'package',
        makeSignaturesFilename(signatureVerificationKeyId)
      )
    )
    for (const [file, signature] of Object.entries(signatures)) {
      const absFile = path.resolve(unpackDir, 'package', file)
      const stat = await fs.lstat(absFile)
      const verify = crypto.createVerify(hashAlgorithm)

      if (stat.isSymbolicLink()) {
        verify.write(await fs.readlink(absFile))
        verify.end()
      } else {
        await pipeline(fs.createReadStream(absFile), verify)
      }
      expect(
        verify.verify(
          publicKeyObject,
          Buffer.from(signature as string, 'base64')
        ),
        `verify signature of ${file}`
      ).to.equal(true)
    }
    const mod = await import(
      path.resolve(unpackDir, 'package', 'src', 'server', 'index.js')
    )
    const contributions = mod.default.default()
    expect(contributions.api)
      .to.be.instanceOf(Function)
      .that.has.property('name')
      .that.equals('router')
  })
})
