import z from 'zod'

export const ContributesSchema = z.strictObject({
  client: z
    .strictObject({
      dashboardWidgets: z.record(
        z.strictObject({
          displayName: z.string(),
          component: z.string(),
        })
      ),
    })
    .optional(),
})

export type Contributes = z.output<typeof ContributesSchema>
