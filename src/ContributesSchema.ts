import z from 'zod'

export const ContributesSchema = z.strictObject({
  dashboardWidgets: z.record(
    z.strictObject({
      displayName: z.string(),
      component: z.string(),
    })
  ),
})

export type Contributes = z.output<typeof ContributesSchema>
