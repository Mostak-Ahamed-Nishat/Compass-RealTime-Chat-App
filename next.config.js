/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Native filesystem events are unreliable on Windows/mapped drives and
      // were causing the dev server to keep detecting phantom changes and
      // reloading. Polling instead makes the watcher stable.
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      }
    }
    return config
  },
}

module.exports = nextConfig
