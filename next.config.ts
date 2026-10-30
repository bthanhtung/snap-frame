import type { NextConfig } from 'next';

// Static export: SnapFrame is a pure client-side app. Every pixel is processed in the browser;
// there are no API routes and nothing is uploaded.
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
