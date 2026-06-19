// next.config.ts
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/AA2L-Tag-Web' : undefined,
  assetPrefix: isProd ? '/AA2L-Tag-Web' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;