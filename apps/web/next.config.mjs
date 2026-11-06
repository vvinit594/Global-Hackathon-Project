import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bitgo'],
  },
  transpilePackages: ['@stealth/shared', '@stealth/crypto', '@stealth/db'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.resolve(__dirname, 'src/utils/router-shim.tsx'),
      'mppx/client': false,
      mppx: false,
    };
    if (isServer) {
      const prev = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [
        ...prev,
        ({ request }, callback) => {
          if (request === 'bitgo' || (request && request.startsWith('@bitgo/'))) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    } else {
      // Client bundle: polyfill 'buffer' so bitcoinjs-lib works in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: false,
        stream: false,
        path: false,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
