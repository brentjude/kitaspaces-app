import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't ignore builds on type errors
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;