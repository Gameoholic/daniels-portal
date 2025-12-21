import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { taint: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
