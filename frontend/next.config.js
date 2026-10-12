const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    { urlPattern: /^https?:\/\/.*\/api\/.*/i, handler: "NetworkOnly" },
    { urlPattern: /^https?:\/\/.*s3.*amazonaws\.com\/.*/i, handler: "NetworkOnly" },
    {
      urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "mapbox-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ["localhost", "agrotrack-uploads.s3.amazonaws.com"],
  },
};

module.exports = withPWA(nextConfig);
