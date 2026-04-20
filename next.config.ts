import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Để Vercel tự động xử lý tracing cho Sharp (đây là cách khuyến nghị mới nhất)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
