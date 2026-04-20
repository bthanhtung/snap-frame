import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chế độ standalone giúp giảm đáng kể kích thước bundle trên Vercel
  output: 'standalone',
  
  // Ép Sharp là external để Vercel tự xử lý binary tối ưu nhất
  serverExternalPackages: ["sharp"],

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
