export const command = 'pull-image'
export const description = `pull Clarity docker image`

export async function handler(): Promise<void> {
  await (await import('./pull-image.lazy.ts')).handler()
}
