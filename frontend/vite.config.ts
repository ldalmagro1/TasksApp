import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In local dev, forward /api/* to the NestJS backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

