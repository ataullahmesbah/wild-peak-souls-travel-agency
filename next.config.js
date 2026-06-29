/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'nodemailer'],
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer }) => {
    config.watchOptions = { poll: false, ignored: /node_modules/ };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
      };
    }
    if (isServer) {
      // Treat cloudinary as an external — it is installed at runtime but
      // not needed at build time, so webpack should not bundle or resolve it.
      const existing = config.externals;
      const externalsFn = (ctx, callback) => {
        if (ctx.request === 'cloudinary') {
          return callback(null, 'commonjs cloudinary');
        }
        if (typeof existing === 'function') {
          return existing(ctx, callback);
        }
        if (Array.isArray(existing)) {
          for (const ext of existing) {
            if (typeof ext === 'function') {
              const result = ext(ctx, callback);
              if (result !== undefined) return result;
            }
          }
        }
        callback();
      };
      config.externals = [externalsFn];
    }
    return config;
  },
  images: {
    domains: [
      'images.pexels.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
  },
};

module.exports = nextConfig;
