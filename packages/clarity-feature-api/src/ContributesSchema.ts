import z from 'zod'

export const ContributesSchema = z.strictObject({
  client: z
    .union([
      z.string(),
      z.strictObject({
        dashboardWidgets: z.record(
          z.string(),
          z
            .strictObject({
              displayName: z.string(),
              component: z.string(),
            })
            .optional()
        ),
      }),
    ])
    .optional(),
})

export type Contributes = z.output<typeof ContributesSchema>
