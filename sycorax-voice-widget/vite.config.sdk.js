import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/SycoraxSDK.jsx'),
      name: 'SycoraxSDK',
      fileName: 'sycorax-sdk',
      formats: ['umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        entryFileNames: 'sycorax-sdk.js'
      }
    },
    outDir: 'dist-sdk',
    emptyOutDir: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})

