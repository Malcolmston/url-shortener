import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
};

export default nextConfig;
