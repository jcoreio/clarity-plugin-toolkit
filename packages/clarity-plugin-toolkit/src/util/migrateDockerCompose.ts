import YAML from 'yaml'
import { replaceRanges } from './replaceRanges.ts'

export function migrateDockerCompose(source: string): string {
  const parsed = YAML.parseDocument(source, { keepSourceTokens: true })

  const replacements: { start: number; end: number; value: string }[] = []

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
