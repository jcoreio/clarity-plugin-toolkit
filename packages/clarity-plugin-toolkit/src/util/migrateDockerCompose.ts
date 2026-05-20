import YAML from 'yaml'
import { replaceRanges } from './replaceRanges.ts'

export function migrateDockerCompose(source: string): string {
  const parsed = YAML.parseDocument(source, { keepSourceTokens: true })

  const replacements: { start: number; end: number; value: string }[] = []

  const app = parsed.getIn(['services', 'app'])
  if (app instanceof YAML.YAMLMap) {
    if (
      !app.items.find(
        (i) =>
          i instanceof YAML.Pair &&
          i.key instanceof YAML.Scalar &&
          typeof i.key.value === 'string' &&
          i.key.value === 'init'
      )
    ) {
      if (app.range) {
        let lineStart = source.lastIndexOf('\r\n', app.range[0])
        if (lineStart < 0) lineStart = source.lastIndexOf('\r', app.range[0])
        if (lineStart < 0) lineStart = source.lastIndexOf('\n', app.range[0])
        replacements.push({
          start: app.range[0],
          end: app.range[0],
          value: `init: true${lineStart < 0 ? '\n' : source.substring(lineStart, app.range[0])}`,
        })
      }
    }
  }

  const appVolumes = parsed.getIn(['services', 'app', 'volumes'])
  if (appVolumes instanceof YAML.YAMLSeq) {
    const nodeModulesVolume = appVolumes.items.find(
      (i): i is YAML.Scalar =>
        i instanceof YAML.Scalar &&
        typeof i.value === 'string' &&
        i.value.startsWith('./node_modules:')
    )
    if (nodeModulesVolume?.range) {
      const substr = source.substring(
        nodeModulesVolume.range[0],
        nodeModulesVolume.range[1]
      )
      const index = substr.indexOf('/external_node_modules')
      if (index >= 0) {
        replacements.push({
          start: nodeModulesVolume.range[0] + index,
          end:
            nodeModulesVolume.range[0] +
            index +
            '/external_node_modules'.length,
          value: '/node_modules/.external',
        })
      }
    }
  }

  return replacements.length ? replaceRanges(source, replacements) : source
}
