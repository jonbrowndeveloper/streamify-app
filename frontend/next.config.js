require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com'],
  },
};