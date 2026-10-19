/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow scraping requests without premature timeouts
  serverExternalPackages: ["cheerio", "https-proxy-agent", "socks-proxy-agent"],
};

export default nextConfig;
