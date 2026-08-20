import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['v3-tooling/test/**/*.test.ts'],
    environment: 'node',
  },
});
