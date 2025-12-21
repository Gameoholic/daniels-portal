import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          // "patterns" is much more powerful than "paths" for this use case
          patterns: [
            {
              // This regex matches any import ending in /dal or /dal.ts
              // It catches @/src/db/dal, ../db/dal, ./dal, etc.
              group: ["**/dal", "**/dal.ts"],
              importNames: ["SecureDBScope"],
              message:
                "SecureDBScope is a private type. Direct access is forbidden outside of _internal functions.",
            },
          ],
        },
      ],
    },
  },

  {
    // Make sure this path exactly matches your folder structure
    // from the project root (where eslint.config.mjs lives)
    files: ["**/src/db/_internal/**/*.ts", "**/db/_internal/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
