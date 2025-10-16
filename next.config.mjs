/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  // output: 'export',

  // basePath: isProd ? '/shoeecom-frontend' : undefined,
  // assetPrefix: isProd ? '/shoeecom-frontend/' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
