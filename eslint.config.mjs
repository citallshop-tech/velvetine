import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

// eslint-config-next (matching Next.js 15) ships legacy "extends"-style
// configs, not flat-config arrays - FlatCompat bridges the two formats
// so this still works under ESLint 9's flat config system.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
