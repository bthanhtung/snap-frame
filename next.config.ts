import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Bỏ qua lỗi ESLint khi build để ưu tiên deploy nhanh
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi Type check khi build nếu cần
    ignoreBuildErrors: true,
  },
  // Cho phép Sharp hoạt động tốt trên Vercel
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
