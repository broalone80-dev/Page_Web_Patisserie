import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

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
import { PaymentController } from '@controllers/paymentController';

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeWebSocket(httpServer);

/**
 * Security Middleware
 */
app.use(helmet());
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
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, réessayez plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

/**
 * Health Check Route
 */
app.get('/health', (req: Request, res: Response) => {
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
 * Payment Callbacks & Webhooks (no auth)
 */
app.get('/api/payments/callback/flutterwave', PaymentController.flutterwaveCallback);
app.get('/api/payments/callback/cinetpay', PaymentController.cinetpayCallback);
app.post('/api/payments/webhook/flutterwave', PaymentController.flutterwaveWebhook);
app.post('/api/payments/webhook/cinetpay', PaymentController.cinetpayWebhook);

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
