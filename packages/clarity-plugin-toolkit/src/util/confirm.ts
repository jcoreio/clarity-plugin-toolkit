import prompt from 'prompts'
import { isInteractive } from './isInteractive.ts'

export async function confirm(
  message: string,
  {
    initial,
    valueIfNotInteractive,
  }: {
    initial?: boolean
    valueIfNotInteractive?: boolean
  } = {}
) {
  if (!isInteractive) {
    if (valueIfNotInteractive == null) {
      throw new Error(
        'valueIfNotInteractive is required if stdio is not interactive'
      )
    }
    return valueIfNotInteractive
  }
  return (
    await prompt({
      name: 'confirm',
      type: 'confirm',
      message,
      initial,
    })
  ).confirm
}
