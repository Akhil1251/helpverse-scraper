/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "cheerio",
    "https-proxy-agent",
    "socks-proxy-agent",
    "bcryptjs",
    "jsonwebtoken",
  ],
};

export default nextConfig;
