import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow-models/mobilenet']
  },
  define: {
    global: 'globalThis'
  }
})
