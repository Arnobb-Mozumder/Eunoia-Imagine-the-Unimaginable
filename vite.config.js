import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  publicDir: 'static',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    open: true
  }
})
