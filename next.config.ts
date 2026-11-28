import type { NextConfig } from 'next';

/** GA on Vercel production, Beta everywhere else (see shared/constants/release.ts). */
const releaseChannel =
  process.env.NEXT_PUBLIC_RELEASE_CHANNEL ??
  (process.env.VERCEL_ENV === 'production' ? 'ga' : 'beta');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_RELEASE_CHANNEL: releaseChannel,
  },
};

export default nextConfig;
