import fs from 'fs-extra'
import findUp from 'find-up'
import { utilDir } from './util/utilDir.cjs'

const packageJsonFile = findUp.sync('package.json', {
  type: 'file',
  cwd: utilDir,
})
if (!packageJsonFile)
  throw new Error(`unexpected: failed to find own package.json file`)
export default fs.readJsonSync(packageJsonFile)
