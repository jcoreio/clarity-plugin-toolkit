export function migrateDotenv(source: string): string {
  if (
    source.includes('AWS_SDK_LOAD_CONFIG') ||
    /^# migrated version: 2$/gm.test(source)
  ) {
    return source
  }
  return `# migrated version: 2\nAWS_SDK_LOAD_CONFIG=1\n${source}`
}
