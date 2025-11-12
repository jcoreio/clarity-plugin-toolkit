import { it } from 'mocha'
import { expect } from 'chai'
import { collectExports } from '../../src/server/collectExports.ts'

it(`collectExports`, function () {
  expect(
    collectExports({
      './webapp': './webapp.js',
    })
  ).to.deep.equal(new Set(['./webapp.js']))
  expect(
    collectExports({
      '.': './index.js',
    })
  ).to.deep.equal(new Set(['./index.js']))
  expect(
    collectExports(
      {
        '.': './index.js',
      },
      new Set(['.'])
    )
  ).to.deep.equal(new Set(['./index.js']))
  expect(
    collectExports(
      {
        '.': './index.js',
      },
      new Set(['./webapp'])
    )
  ).to.deep.equal(new Set([]))

  expect(
    collectExports(
      {
        './webapp': './webapp.js',
        './background': './background.js',
      },
      new Set(['./webapp'])
    )
  ).to.deep.equal(new Set(['./webapp.js']))
  expect(
    collectExports({
      './webapp': {
        import: './webapp.mjs',
        default: './webapp.js',
      },
    })
  ).to.deep.equal(new Set(['./webapp.mjs', './webapp.js']))
  expect(
    collectExports(
      {
        './webapp': {
          import: './webapp.mjs',
          default: './webapp.js',
        },
      },
      new Set(['./background'])
    )
  ).to.deep.equal(new Set([]))
  expect(
    collectExports(
      {
        './webapp': {
          import: './webapp.mjs',
          default: './webapp.js',
        },
        './background': {
          import: './background.mjs',
          default: './background.js',
        },
      },
      new Set(['./background'])
    )
  ).to.deep.equal(new Set(['./background.mjs', './background.js']))
  expect(
    collectExports(
      {
        import: {
          './webapp': './webapp.mjs',
          './background': './background.mjs',
        },
        default: {
          './webapp': './webapp.js',
          './background': './background.js',
        },
      },
      new Set(['./background'])
    )
  ).to.deep.equal(new Set(['./background.mjs', './background.js']))
})
