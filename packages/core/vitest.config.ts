import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests share one database, so they must not run concurrently.
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
