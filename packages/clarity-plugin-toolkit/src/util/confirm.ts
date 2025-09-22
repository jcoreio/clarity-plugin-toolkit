import prompt from 'prompts'

export async function confirm(
  message: string,
  {
    initial,
  }: {
    initial?: boolean
  } = {}
) {
  return (
    await prompt({
      name: 'confirm',
      type: 'confirm',
      message,
      initial,
    })
  ).confirm
}
