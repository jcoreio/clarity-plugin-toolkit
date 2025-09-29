import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function tsconfig({
  useTypescript,
  useToolchain,
  clarityPluginToolkitDir,
}: TemplateOptions) {
  if (!useTypescript || useToolchain) return {}
  return {
    'tsconfig.json': dedent`
      {
        "compilerOptions": {
          "lib": ["dom", "dom.iterable", "esnext"],
          "allowJs": true,
          "skipLibCheck": true,
          "strict": true,
          "noEmit": true,
          "esModuleInterop": true,
          "module": "esnext",
          "moduleResolution": "bundler",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "incremental": true,
        },
        "include": ["**/*.tsx", "*.ts"],
        "exclude": ["node_modules", ${JSON.stringify(clarityPluginToolkitDir)}]
      }
    `,
  }
}
