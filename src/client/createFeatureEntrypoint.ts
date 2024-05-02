import fs from 'fs-extra'
import path from 'node:path'
import util from 'node:util'
import { clientEntrypointFile } from '../constants'
import dedent from 'dedent-js'
import { mapValues } from 'lodash'
import getProject from '../getProject'

const print = (jsonish: any) =>
  util.inspect(jsonish, { depth: null, colors: false })

const literal = (strings: TemplateStringsArray, ...quasis: any) => ({
  [util.inspect.custom]() {
    return strings
      .flatMap((s, i) => (i < quasis.length ? [s, print(quasis[i])] : [s]))
      .join('')
  },
})

export async function createFeatureEntrypoint({
  rootDir,
}: {
  rootDir: string
}): Promise<void> {
  const { packageJson } = await getProject()
  const { client: { dashboardWidgets, ...rest } = {} } = packageJson.contributes
  await fs.mkdirs(path.resolve(rootDir, path.dirname(clientEntrypointFile)))

  const importFile = (file: string) =>
    literal`import(${path.relative(
      path.dirname(path.resolve(rootDir, clientEntrypointFile)),
      path.resolve(rootDir, file)
    )})`
  await fs.writeFile(
    path.resolve(rootDir, clientEntrypointFile),
    dedent`
    ${dashboardWidgets ? `import * as React from 'react'` : ''}
    export default ${print({
      ...rest,
      ...(dashboardWidgets
        ? {
            dashboardWidgets: mapValues(
              dashboardWidgets,
              ({ component, ...rest }) => ({
                ...rest,
                component: literal`React.lazy(() => ${importFile(component)})`,
              })
            ),
          }
        : {}),
    })}
  `,
    'utf8'
  )
}
