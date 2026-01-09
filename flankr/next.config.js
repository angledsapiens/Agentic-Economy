/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '../dist_flankr',
  experimental: {
    serverComponentsExternalPackages: ['@agentic-economy/liquidity-intents-sdk-v0'],
  },
  webpack: (config) => {
    config.externals.push('javascript-obfuscator'); // Ensure this is also external if referenced
    return config;
  }
};

module.exports = nextConfig;
