import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { config } from './env';
import { verifyAccessToken } from '@utils/jwt';

let io: SocketServer;

/**
 * Initialize Socket.IO server for real-time chat
 */
export const initializeWebSocket = (httpServer: HttpServer): SocketServer => {
    io = new SocketServer(httpServer, {
        cors: {
            origin: config.cors.origin,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Fallback for unstable connections (Cameroon context)
        transports: ['websocket', 'polling'],
        pingTimeout: 30000,
        pingInterval: 25000,
    });

    // Authentication middleware for Socket.IO
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
            return next(new Error('Invalid token'));
        }

        // Attach user data to socket
        (socket as any).userId = payload.id;
        (socket as any).isAdmin = payload.isAdmin;
        next();
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        console.log(`🔌 User connected: ${userId}`);

        // Join user's personal room for notifications
        socket.join(`user:${userId}`);

        // Join order chat rooms
        socket.on('join_order', (orderId: string) => {
            socket.join(`order:${orderId}`);
            console.log(`📦 User ${userId} joined order room: ${orderId}`);
        });

        socket.on('leave_order', (orderId: string) => {
            socket.leave(`order:${orderId}`);
        });

        // Handle chat messages
        socket.on('send_message', async (data: { orderId: string; content: string }) => {
            // Message is saved via REST API, this just broadcasts
            io.to(`order:${data.orderId}`).emit('new_message', {
                orderId: data.orderId,
                senderId: userId,
                content: data.content,
                createdAt: new Date().toISOString(),
            });
        });

        // Typing indicator
        socket.on('typing', (data: { orderId: string }) => {
            socket.to(`order:${data.orderId}`).emit('user_typing', {
                userId,
                orderId: data.orderId,
            });
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${userId}`);
        });
    });

    return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): SocketServer => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Emit event to an order room
 */
export const emitToOrder = (orderId: string, event: string, data: any): void => {
    if (io) {
        io.to(`order:${orderId}`).emit(event, data);
    }
};
