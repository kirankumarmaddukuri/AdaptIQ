import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Remove origin header so backend never blocks proxied requests with CORS checks
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  }
})
