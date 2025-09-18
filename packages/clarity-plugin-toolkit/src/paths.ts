import path from 'path'

export const paths = (projectDir: string) => {
  const clarityPluginToolkitDir = path.resolve(
    projectDir,
    '.clarity-plugin-toolkit'
  )
  const distDir = path.join(clarityPluginToolkitDir, 'dist')
  const distServerDir = path.join(distDir, 'server')
  return {
    clarityPluginToolkitDir,
    emptyEntryFile: path.join(clarityPluginToolkitDir, 'empty.js'),
    distDir,
    distClientDir: path.join(distDir, 'client'),
    distServerDir,
    clientAssetsFile: path.join(clarityPluginToolkitDir, 'client-assets.json'),
    serverTarball: path.join(distServerDir, 'bundle.tgz'),
    signingKeyFile: path.join(clarityPluginToolkitDir, 'clarity-signing-key'),
  }
}
