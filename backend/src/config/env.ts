import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// ============================================
// SECURITY: Enforce required secrets in production
// ============================================
const isProd = process.env.NODE_ENV === 'production';

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  // Block default secrets in production
  if (isProd && ['default-secret', 'default-refresh-secret'].includes(value)) {
    throw new Error(`❌ SECURITY: ${key} must be changed from default value in production`);
  }
  return value;
}

export const config = {
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET', isProd ? undefined : 'dev-secret-' + crypto.randomBytes(8).toString('hex')),
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', isProd ? undefined : 'dev-refresh-' + crypto.randomBytes(8).toString('hex')),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@guigui.cm',
  },
  payment: {
    // Mobile Money Cameroun
    orangeApiUrl: process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/cm/v1',
    orangeApiKey: process.env.ORANGE_MONEY_API_KEY || '',
    orangeClientId: process.env.ORANGE_MONEY_CLIENT_ID || '',
    orangeClientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET || '',
    orangeMerchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY || '',
    mtnApiUrl: process.env.MTN_MOMO_API_URL || 'https://proxy.momoapi.mtn.com',
    mtnApiKey: process.env.MTN_MOMO_API_KEY || '',
    mtnApiUserId: process.env.MTN_MOMO_API_USER_ID || '',
    mtnSubscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
    mtnEnvironment: process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
    // Webhook secrets
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
    // Flutterwave (legacy)
    flutterwaveApiKey: process.env.FLUTTERWAVE_API_KEY || '',
    flutterwaveSecretHash: process.env.FLUTTERWAVE_SECRET_HASH || '',
    cinetpayApiKey: process.env.CINETPAY_API_KEY || '',
    cinetpaySiteId: process.env.CINETPAY_SITE_ID || '',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilioSid: process.env.TWILIO_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioFrom: process.env.TWILIO_FROM_NUMBER || '',
    atApiKey: process.env.AT_API_KEY || '',
    atUsername: process.env.AT_USERNAME || '',
  },
  whatsapp: {
    businessPhone: process.env.WHATSAPP_BUSINESS_PHONE || '',
  },
};

export const isDevelopment = config.server.nodeEnv === 'development';
export const isProduction = config.server.nodeEnv === 'production';
