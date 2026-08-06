import type { Metadata, Viewport } from 'next';
import { env } from '@/server/env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: 'Mi Colección de Camisetas',
    template: '%s · Mi Colección de Camisetas',
  },
  description:
    'Organizá, filtrá y compartí tu colección de camisetas de fútbol con estadísticas y enlaces públicos.',
  applicationName: 'Mi Colección de Camisetas',
  openGraph: {
    type: 'website',
    siteName: 'Mi Colección de Camisetas',
    locale: 'es_AR',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#0d1117',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="es">
    <body>
      <a href="#main" className="skip-link bg-grass-500 text-pitch-950 rounded px-4 py-2 font-medium">
        Saltar al contenido
      </a>
      {children}
    </body>
  </html>
);

export default RootLayout;
