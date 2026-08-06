import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Mi Colección de Camisetas',
  short_name: 'Mi Colección',
  description: 'Organizá, filtrá y compartí tu colección de camisetas de fútbol.',
  start_url: '/',
  display: 'standalone',
  background_color: '#0a0a0b',
  theme_color: '#0a0a0b',
  lang: 'es-AR',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
});

export default manifest;
