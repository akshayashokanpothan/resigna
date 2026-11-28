import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { brandPalette } from '@/shared/theme/colors';

/** Web app manifest, built from the brand kit's 02_App_Icons/manifest.json. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.tagline,
    start_url: '/',
    display: 'standalone',
    theme_color: brandPalette.deepCharcoal,
    background_color: brandPalette.deepCharcoal,
    icons: [
      { src: '/brand/icons/android-192-dark.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icons/pwa-512-dark.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/brand/icons/maskable-512-dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
