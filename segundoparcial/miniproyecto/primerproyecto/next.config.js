const MINI_SERVIDOR_URL = 'http://localhost:3000'
const BACKEND_URL = 'http://localhost:3001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/mini/:path*',
          destination: 'http://localhost:3000/:path*',
        },
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
};


module.exports = nextConfig; 