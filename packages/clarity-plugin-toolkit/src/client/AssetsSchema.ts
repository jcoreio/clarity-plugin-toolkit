import z from 'zod'

export const AssetsSchema = z.object({
  outputPath: z.string(),
  entrypoints: z.array(z.string()),
  devEntrypoints: z.array(z.string()).optional(),
  otherAssets: z.array(z.string()),
})

export type Assets = z.output<typeof AssetsSchema>
