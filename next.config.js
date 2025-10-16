
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Ensure Next.js knows we're using it in a special way
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
