import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

import { config, isDevelopment } from '@config/env';
import prisma from '@config/database';
import { initializeWebSocket } from '@config/websocket';

// Routes
import authRoutes from '@routes/authRoutes';
import productRoutes from '@routes/productRoutes';
import orderRoutes from '@routes/orderRoutes';
import adminRoutes from '@routes/adminRoutes';
import paymentRoutes from '@routes/paymentRoutes';
import chatRoutes from '@routes/chatRoutes';
import categoryRoutes from '@routes/categoryRoutes';
import notificationRoutes from '@routes/notificationRoutes';
import uploadRoutes from '@routes/uploadRoutes';

// Middleware
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeWebSocket(httpServer);

/**
 * Request ID (correlation ID for tracing)
 */
app.use((req: Request, _res: Response, next) => {
  (req as any).requestId = crypto.randomUUID();
  next();
});

/**
 * Static uploads folder (before helmet to avoid restrictive headers on images)
 */
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * Security Middleware
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", config.server.frontendUrl],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Logging Middleware
 */
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

/**
 * Rate Limiting — tuned for high traffic
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 300, // 300 req/15min in production per IP
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // don't rate-limit health checks
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
});

const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'Trop de tentatives de paiement.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/payments/mobile/initiate', paymentLimiter);

/**
 * Health Check Route
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

/**
 * Error Handling Middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Database Connection & Server Start
 */
const PORT = config.server.port;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Use httpServer instead of app.listen for Socket.IO support
    httpServer.listen(PORT, () => {
      console.log(
        `✅ Server running at ${config.server.apiBaseUrl} (${config.server.nodeEnv})`
      );
      console.log('🔌 WebSocket ready for connections');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  io.close();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
