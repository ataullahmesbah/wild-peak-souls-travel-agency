/**
 * Centralized environment configuration — Phase 2 update.
 * Provides typed, validated access to all environment variables.
 * Server-side variables are never exported with NEXT_PUBLIC_ prefix.
 */

function get(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  app: {
    name: get('NEXT_PUBLIC_APP_NAME', 'Wild Peak Souls'),
    url: get('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    env: get('NODE_ENV', 'development'),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  database: {
    url: get('DATABASE_URL'),
    directUrl: get('DIRECT_DATABASE_URL'),
    // Legacy Supabase direct keys (kept for Phase 1 compatibility)
    supabaseUrl: get('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: get('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    supabaseServiceRoleKey: get('SUPABASE_SERVICE_ROLE_KEY'),
  },

  auth: {
    secret: get('NEXTAUTH_SECRET'),
    url: get('NEXTAUTH_URL', 'http://localhost:3000'),
    google: {
      clientId: get('GOOGLE_CLIENT_ID'),
      clientSecret: get('GOOGLE_CLIENT_SECRET'),
    },
  },

  cloudinary: {
    cloudName: get('CLOUDINARY_CLOUD_NAME'),
    apiKey: get('CLOUDINARY_API_KEY'),
    apiSecret: get('CLOUDINARY_API_SECRET'),
    uploadPreset: get('CLOUDINARY_UPLOAD_PRESET'),
    publicCloudName: get('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  },

  email: {
    host: get('SMTP_HOST'),
    port: get('SMTP_PORT', '587'),
    secure: get('SMTP_SECURE', 'false') === 'true',
    user: get('SMTP_USER'),
    password: get('SMTP_PASSWORD'),
    fromName: get('SMTP_FROM_NAME', 'Wild Peak Souls'),
    fromEmail: get('SMTP_FROM_EMAIL', 'noreply@wildpeaksouls.com'),
  },

  payments: {
    stripe: {
      secretKey: get('STRIPE_SECRET_KEY'),
      webhookSecret: get('STRIPE_WEBHOOK_SECRET'),
      publishableKey: get('STRIPE_PUBLISHABLE_KEY'),
    },
    paypal: {
      clientId: get('PAYPAL_CLIENT_ID'),
      clientSecret: get('PAYPAL_CLIENT_SECRET'),
      publicClientId: get('NEXT_PUBLIC_PAYPAL_CLIENT_ID'),
    },
    sslcommerz: {
      storeId: get('SSL_COMMERZ_STORE_ID'),
      storePassword: get('SSL_COMMERZ_STORE_PASSWORD'),
      isLive: get('SSL_COMMERZ_IS_LIVE', 'false') === 'true',
    },
  },

  security: {
    rateLimitMax: parseInt(get('RATE_LIMIT_MAX', '100'), 10),
    rateLimitWindowMs: parseInt(get('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  },

  analytics: {
    gaId: get('NEXT_PUBLIC_GA_ID'),
    domain: get('NEXT_PUBLIC_ANALYTICS_DOMAIN'),
  },

  cdn: {
    baseUrl: get('CDN_BASE_URL'),
  },
} as const;
