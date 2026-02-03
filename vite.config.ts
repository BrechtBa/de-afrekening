import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon.png'],
      manifest: {
        name: 'De afrekening',
        short_name: 'De afrekening',
        description: 'Afrekeningen, simpel en offline',
        theme_color: '#ffffff',
        icons: [
          {
            src: '192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '152x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
