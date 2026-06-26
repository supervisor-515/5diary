import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves this repo under /5diary/
export default defineConfig({
  base: '/5diary/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Warm Paper Diary',
        short_name: 'Diary',
        description: '물리 5년/10년 일기장을 디지털로 옮긴 사진 일기',
        lang: 'ko',
        start_url: '/5diary/',
        scope: '/5diary/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4EEE2',
        theme_color: '#C8785A',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
