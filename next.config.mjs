/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static files uchun qo'shimcha sozlamalar
  async rewrites() {
    return [
      // Static fayllar uchun rewrite qoidalari
      {
        source: '/favicon.ico',
        destination: '/favicon.ico',
      },
      {
        source: '/logo.png',
        destination: '/logo.png',
      },
    ];
  },
  // Static export uchun sozlamalar
  trailingSlash: false,
  output: 'standalone',
}

export default nextConfig
