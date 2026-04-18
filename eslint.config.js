const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "apps/api/uploads/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["apps/api/src/**/*.ts", "apps/api/prisma/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-misused-promises": "off"
    }
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "apps/web/vite.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-undef": "off"
    }
  }
);
