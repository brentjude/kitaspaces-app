import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't ignore builds on type errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;