import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

/**
 * Image URLs are absolute because og:image requires it, so every host that may serve them has
 * to be declared here: the app itself in development, and the bucket in production.
 */
const imageHosts = [process.env['APP_URL'], process.env['R2_PUBLIC_URL']]
  .filter((value): value is string => value !== undefined && value.length > 0)
  .map((value) => new URL(value))
  .map((url) => ({
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    hostname: url.hostname,
    ...(url.port === '' ? {} : { port: url.port }),
  }));

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: imageHosts },
  transpilePackages: ['@camisetas/contracts', '@camisetas/core', '@camisetas/db'],
  headers: () => Promise.resolve([{ source: '/:path*', headers: securityHeaders }]),
  // serverExternalPackages does not apply to packages reached through transpilePackages, so
  // argon2 is externalised here: its platform-specific .node binary cannot be parsed by webpack
  // and must be required at runtime instead.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        { '@node-rs/argon2': 'commonjs @node-rs/argon2' },
      ];
    }
    return config;
  },
};

export default config;
