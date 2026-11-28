import type { Metadata, Viewport } from 'next';
import { preconnect } from 'react-dom';
import { env } from '@/config/env';
import { IBM_Plex_Mono, Inter } from 'next/font/google';
import { Providers } from '@/providers';
import { siteConfig } from '@/config/site';
import { brandPalette } from '@/shared/theme/colors';
import { IS_BETA } from '@/shared/constants/release';
import { BetaStrip } from '@/shared/components/BetaBadge';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  // Beta builds get a favicon with an amber dot so BA tabs stand out from GA tabs.
  icons: IS_BETA
    ? {
        icon: [
          { url: '/brand/icons/favicon-beta.ico', sizes: 'any' },
          { url: '/brand/icons/icon-32-beta.png', type: 'image/png', sizes: '32x32' },
        ],
        apple: '/brand/icons/apple-icon-180-beta.png',
      }
    : {
        icon: [
          { url: '/brand/icons/favicon.ico', sizes: 'any' },
          { url: '/brand/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
        ],
        apple: '/brand/icons/apple-icon-180.png',
      },
  robots: { index: false, follow: false }, // Will enable on launch
};

export const viewport: Viewport = {
  themeColor: brandPalette.deepCharcoal,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Open the TLS connection to Supabase while the page is still loading, so the first data
  // request doesn't pay for the handshake.
  preconnect(env.NEXT_PUBLIC_SUPABASE_URL, { crossOrigin: 'anonymous' });

  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        {IS_BETA && <BetaStrip />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
