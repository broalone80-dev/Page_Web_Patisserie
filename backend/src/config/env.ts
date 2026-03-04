import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
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
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio', // twilio | africas_talking
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
