import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";
import eslintConfigPrettier from "eslint-config-prettier";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default defineConfig([
  eslint.configs.recommended,

  includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
  {
    files: ["./*.{js,cjs,mjs}", "src/server/**/*.{js,cjs,mjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ...reactPlugin.configs.flat.recommended,
    files: ["src/client/**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: { ...globals.serviceworker, ...globals.browser },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    rules: {
      "react/prop-types": 0,
    },
  },
  eslintConfigPrettier,
]);
