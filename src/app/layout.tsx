import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel-Art Piano Simulator',
  description: 'Top-down pixel art piano simulator for web, mobile, and MIDI.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased select-none touch-none">
        {children}
      </body>
    </html>
  );
}
