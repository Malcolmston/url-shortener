import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Allow inline SVGs and data URIs in images
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
};

export default nextConfig;
