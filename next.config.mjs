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
    // Image optimization
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 yil cache
  },
  // Performance optimizatsiyalari
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
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
  // Compression
  compress: true,
  // Cache headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(ico|png|jpg|jpeg|gif|webp|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

export default nextConfig
