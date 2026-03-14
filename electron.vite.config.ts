import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: [] })],
    build: {
      outDir: 'build/main',
      rollupOptions: {
        input: { main: 'electron/main.ts' },
        external: ['electron'],
        output: { format: 'cjs', entryFileNames: '[name].js' },
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: [] })],
    build: {
      outDir: 'build/preload',
      rollupOptions: {
        input: { preload: 'electron/preload.ts' },
        external: ['electron'],
        output: { format: 'cjs', entryFileNames: '[name].js' },
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    build: {
      outDir: 'build/renderer',
      rollupOptions: {
        input: { index: 'src/renderer/index.html' }
      }
    }
  }
})
