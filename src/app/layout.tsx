import type { Metadata, Viewport } from 'next';
import { PwaRegister } from '../components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Piano - Grand Piano Simulator',
  description: 'Top-down pixel art piano simulator for web, mobile, and MIDI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PixelPiano',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased select-none touch-none overscroll-none">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
