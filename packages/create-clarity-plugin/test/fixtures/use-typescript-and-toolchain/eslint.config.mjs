// @ts-check

import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import eslintConfigPrettier from "eslint-config-prettier";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  {
    files: ["./*.{js,mjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ...reactPlugin.configs.flat.recommended,
    files: ["src/client/**/*.{js,jsx,mjs,cjs,ts,tsx"],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: { ...globals.serviceworker, ...globals.browser },
    },
  },
  eslintConfigPrettier,
);
