function isValidIdentifier(elem: string | number): boolean {
  return typeof elem === 'string' && /^[_a-z][_a-z0-9]+$/i.test(elem)
}

export default function stringifyPath(path: (string | number)[]): string {
  return path
    .map((elem, index) =>
      isValidIdentifier(elem) ?
        index === 0 ?
          elem
        : `.${elem}`
      : `[${JSON.stringify(elem)}]`
    )
    .join('')
}
