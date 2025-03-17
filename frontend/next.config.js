const loadSettings = require('./loadSettings');

loadSettings();

module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com'],
  },
};