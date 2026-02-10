import { defineConfig } from 'tsup'

export default defineConfig([
  // Client bundle (React component)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    external: ['react', 'react-dom'],
    clean: true,
    minify: true,
    treeshake: true,
    sourcemap: true,
  },
  // Server bundle (Node.js fetch interceptor + SSE)
  {
    entry: ['src/server.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    platform: 'node',
    clean: false,
    minify: true,
    treeshake: true,
    sourcemap: true,
  },
])
