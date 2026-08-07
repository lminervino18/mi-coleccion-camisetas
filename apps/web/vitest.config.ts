import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The Playwright specs share the .spec.ts extension; picking them up here makes Vitest
    // try to run them and fail on Playwright's own test hooks.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', 'e2e/**'],
  },
});
