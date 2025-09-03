import path from 'path'

export const paths = (projectDir: string) => {
  const clarityFeatureToolkitDir = path.resolve(
    projectDir,
    '.clarity-feature-toolkit'
  )
  const distDir = path.join(clarityFeatureToolkitDir, 'dist')
  const distServerDir = path.join(distDir, 'server')
  return {
    clarityFeatureToolkitDir,
    emptyEntryFile: path.join(clarityFeatureToolkitDir, 'empty.js'),
    distDir,
    distClientDir: path.join(distDir, 'client'),
    distServerDir,
    clientAssetsFile: path.join(clarityFeatureToolkitDir, 'client-assets.json'),
    serverTarball: path.join(distServerDir, 'bundle.tgz'),
    signingKeyFile: path.join(clarityFeatureToolkitDir, 'clarity-signing-key'),
  }
}
