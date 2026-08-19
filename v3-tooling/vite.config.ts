import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SummernoteBricksV3',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'summernote-bricks.js' : 'summernote-bricks.umd.js',
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
