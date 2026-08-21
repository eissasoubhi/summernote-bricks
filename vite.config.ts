import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'SummernoteBricksV3',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'summernote-bricks.js' : 'summernote-bricks.umd.cjs',
    },
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    sourcemap: true,
    emptyOutDir: true,
  },
});
