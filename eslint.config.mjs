import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginNext from "@next/eslint-plugin-next";
import eslintPluginTs from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      next: eslintPluginNext,
      "@typescript-eslint": eslintPluginTs,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // =====================
      // TypeScript
      // =====================
      "@typescript-eslint/explicit-function-return-type": "off",

      // =====================
      // Next.js
      // =====================
      "next/no-img-element": "warn",
      "next/no-css-tags": "error",

      // =====================
      // Global import restrictions
      // =====================
      "no-restricted-imports": [
        "error",
        {
          // Exact module paths (aliases)
          paths: [
            {
              name: "@/db/_internal/server_types",
              message:
                "server_types is internal-only. Do not import it directly.",
            },
            {
              name: "@/src/db/_internal/server_types",
              message:
                "server_types is internal-only. Do not import it directly.",
            },
          ],

          // Pattern-based (relative / deep imports)
          patterns: [
            // Block SecureDBScope everywhere except _internal
            {
              group: ["**/dal", "**/dal.ts", "@/db/dal", "@/src/db/dal"],
              importNames: ["SecureDBScope"],
              message:
                "SecureDBScope access is restricted. Use executeDatabaseQuery in dal.ts.",
            },

            // Block *entire* server_types module
            {
              group: ["**/server_types", "**/server_types.ts"],
              message:
                "server_types is internal-only. Do not import it directly.",
            },

            // Block executeDatabaseQuery by default
            {
              group: ["**/dal", "**/dal.ts", "@/db/dal", "@/src/db/dal"],
              importNames: ["executeDatabaseQuery"],
              message:
                "executeDatabaseQuery can only be used within Server Actions (src/actions).",
            },
          ],
        },
      ],
    },
  },

  // =====================
  // Exception: internal DB files and dal and middleware
  // =====================
  {
    files: ["**/db/_internal/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["**/db/dal.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["**/middleware.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // =====================
  // Exception: server actions
  // =====================
  {
    files: ["**/actions/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/dal", "**/dal.ts", "@/db/dal", "@/src/db/dal"],
              importNames: ["SecureDBScope"],
              message:
                "SecureDBScope access is restricted. Use executeDatabaseQuery in dal.ts.",
            },
          ],
        },
      ],
    },
  },

  // =====================
  // Prettier + ignores
  // =====================
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
