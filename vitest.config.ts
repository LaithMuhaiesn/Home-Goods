import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Never let Vitest pick up the Playwright *.spec.ts suite.
    exclude: ["tests/**/*.spec.ts", "node_modules/**"],
  },
});
