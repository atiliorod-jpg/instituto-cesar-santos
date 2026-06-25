import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync } from 'fs'

// Em produção (GitHub Pages) o app vive em /ics-app/ — o workflow define VITE_BASE.
const base = process.env.VITE_BASE || '/'

// Copia index.html → 404.html para que GitHub Pages sirva o app em rotas diretas (SPA fallback)
const ghPagesFallback = {
  name: 'gh-pages-404-fallback',
  closeBundle() {
    try { copyFileSync('dist/index.html', 'dist/404.html') } catch {}
  },
}

// https://vite.dev/config/
export default defineConfig({
  base,
  server: { port: 5174 },
  plugins: [
    react(),
    ghPagesFallback,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'maskable.svg', 'logo-ics.png'],
      manifest: {
        name: 'Instituto César Santos',
        short_name: 'ICS Gastronomia',
        description: 'Gestão de consultorias gastronômicas do Instituto César Santos',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'any',
        background_color: '#232323',
        theme_color: '#232323',
        categories: ['food', 'business', 'productivity'],
        icons: [
          // SVG escalável (nítido em qualquer tamanho) como ícone principal
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          // Versão maskable (full-bleed, sem cantos) para Android adaptive icons
          { src: 'maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          // Fallback raster (logo quadrado real 1254×1254) p/ plataformas sem SVG
          { src: 'logo-ics.png', sizes: '1254x1254', type: 'image/png', purpose: 'any' },
        ],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
