import type { Metadata, Viewport } from 'next';
import { Caveat, Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Fonts are bundled at build time (no requests to Google at runtime) and also used to draw frame captions.
const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin', 'vietnamese'], variable: '--font-fraunces', display: 'swap', style: ['normal', 'italic'] });
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], variable: '--font-jetbrains', display: 'swap' });
const caveat = Caveat({ subsets: ['latin', 'latin-ext'], variable: '--font-caveat', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://snap-frame.tungdadev.com'),
  title: 'SnapFrame — film looks & photo frames, right in your browser',
  description: 'Kodak & Fujifilm-inspired film looks, elegant frames with camera details, batch export. 100% in your browser — your photos never leave your device.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'SnapFrame — film looks & photo frames',
    description: 'Film looks and beautiful frames for your photos. Runs entirely in your browser.',
    images: ['/og.jpg'], type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  appleWebApp: { capable: true, title: 'SnapFrame', statusBarStyle: 'black-translucent' },
};
export const viewport: Viewport = { themeColor: '#0c0c0d', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${mono.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head><script src="/theme.js" /></head>
      <body>{children}</body>
    </html>
  );
}
