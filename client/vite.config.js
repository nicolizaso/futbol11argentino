import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Fútbol 11 Argentino',
        short_name: 'F11 Arg',
        description: 'Juegos de trivia futbolera argentina',
        theme_color: '#0D1B2A',
        background_color: '#0D1B2A',
        icons: [
          {
            src: 'img/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'img/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
