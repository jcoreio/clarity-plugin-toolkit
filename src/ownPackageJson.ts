import fs from 'fs-extra'
import findUp from 'find-up'

const packageJsonFile = findUp.sync('package.json', {
  type: 'file',
  cwd: __dirname,
})
if (!packageJsonFile)
  throw new Error(`unexpected: failed to find own package.json file`)
export default fs.readJsonSync(packageJsonFile)
