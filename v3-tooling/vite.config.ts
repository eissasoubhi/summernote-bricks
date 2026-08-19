import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: new URL('./src/index.ts', import.meta.url).pathname,
      name: 'SummernoteBricksV3',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'summernote-bricks.js' : 'summernote-bricks.umd.js',
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
