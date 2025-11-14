export function replaceRanges(
  source: string,
  replacements: { start: number; end: number; value: string }[]
) {
  replacements.sort((a, b) => a.start - b.start)

  const parts = []
  let end = 0
  for (const r of replacements) {
    if (r.start > end) {
      parts.push(source.substring(end, r.start))
    }
    parts.push(r.value)
    end = r.end
  }
  if (end < source.length) {
    parts.push(source.substring(end))
  }

  return parts.join('')
}
