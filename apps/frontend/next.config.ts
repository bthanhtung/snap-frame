import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    // Empty string = same domain (production). Falls back to localhost in local dev.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL !== undefined
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://localhost:3000',
  },
};

export default nextConfig;
