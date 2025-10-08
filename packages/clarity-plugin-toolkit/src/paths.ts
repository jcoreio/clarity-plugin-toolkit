import path from 'path'
import fs from 'fs-extra'

export const paths = (projectDir: string) => {
  const clarityPluginToolkitDir = path.resolve(
    projectDir,
    '.clarity-plugin-toolkit'
  )
  const distDir = path.join(clarityPluginToolkitDir, 'dist')
  const devDir = path.join(clarityPluginToolkitDir, 'dev')
  let clientDirName = 'client'
  let i = 0
  while (fs.pathExistsSync(path.join(projectDir, clientDirName))) {
    clientDirName = `_client${i++ || ''}`
  }
  return {
    clarityPluginToolkitDir,
    emptyEntryFile: path.join(clarityPluginToolkitDir, 'empty.js'),
    clientAssetsFile: path.join(clarityPluginToolkitDir, 'client-assets.json'),
    envFile: path.join(clarityPluginToolkitDir, 'env.json'),
    signingKeyFile: path.join(clarityPluginToolkitDir, 'clarity-signing-key'),
    distDir,
    distPackageJsonFile: path.join(distDir, 'package.json'),
    distClientDir: path.join(distDir, clientDirName),
    devDir,
    dockerComposeFile: path.join(projectDir, 'docker-compose.yml'),
    dotenvFile: path.join(projectDir, '.env'),
  }
}
