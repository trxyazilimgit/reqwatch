import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  clean: true,
  minify: true,
  treeshake: true,
  sourcemap: true,
})
