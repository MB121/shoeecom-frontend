/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/shoeecom-frontend',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
