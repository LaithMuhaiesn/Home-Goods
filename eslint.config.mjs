import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships native ESLint flat configs, so no FlatCompat shim
// (and no @eslint/eslintrc) is needed.
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      ".vitest/**",
      "coverage/**",
    ],
  },
];

export default eslintConfig;
