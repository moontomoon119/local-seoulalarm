/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // HTTPS 설정
  experimental: {
    https: true
  }
}

module.exports = nextConfig