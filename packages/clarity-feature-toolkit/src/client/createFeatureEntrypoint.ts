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
  const { client } = packageJson.contributes

  const relativePath = (file: string) =>
    path.relative(
      path.dirname(path.resolve(rootDir, clientEntrypointFile)),
      path.resolve(rootDir, file)
    )

  await fs.mkdirs(path.resolve(rootDir, path.dirname(clientEntrypointFile)))
  if (typeof client === 'string') {
    await fs.writeFile(
      path.resolve(rootDir, clientEntrypointFile),
      dedent`
        export { default } from ${JSON.stringify(relativePath(client))}
      `,
      'utf8'
    )
  } else {
    const { dashboardWidgets, ...rest } = client || {}

    const importFile = (file: string) => literal`import(${relativePath(file)})`
    await fs.writeFile(
      path.resolve(rootDir, clientEntrypointFile),
      dedent`
        ${dashboardWidgets ? `import * as React from 'react'` : ''}
        export default ${print({
          ...rest,
          ...(dashboardWidgets ?
            {
              dashboardWidgets: mapValues(dashboardWidgets, (value) => {
                if (!value) return value
                const { component, ...rest } = value
                return {
                  ...rest,
                  component: literal`React.lazy(() => ${importFile(component)})`,
                }
              }),
            }
          : {}),
        })}
      `,
      'utf8'
    )
  }
}
