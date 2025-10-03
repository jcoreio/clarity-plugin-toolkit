import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function tsconfig({
  useTypescript,
  useToolchain,
  clarityPluginToolkitDir,
}: TemplateOptions) {
  if (!useTypescript) return {}
  if (useToolchain) {
    return {
      'tsconfig.json': dedent`
        {
          "extends": "./node_modules/@jcoreio/toolchain-typescript/tsconfig.json",
          "include": ["./src", "./test", "./*.ts"],
          "exclude": ["node_modules"],
          "compilerOptions": {
            "module": "nodenext"
          }
        }
      `,
    }
  }
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
          "module": "nodenext",
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
