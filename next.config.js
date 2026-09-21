/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '*.supabase.co', '*.supabase.in'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig
