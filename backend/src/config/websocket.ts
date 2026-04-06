import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { config } from './env';
import { verifyAccessToken } from '@utils/jwt';
import prisma from '@config/database';

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
        (socket as any).isManager = payload.isManager;
        next();
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        const isAdmin = (socket as any).isAdmin;
        const isManager = (socket as any).isManager;
        console.log(`🔌 User connected: ${userId}`);

        // Join user's personal room for notifications
        socket.join(`user:${userId}`);

        // Join manager room if admin/manager
        if (isAdmin || isManager) {
            socket.join('managers');
        }

        // Join order chat rooms — with ownership verification
        socket.on('join_order', async (orderId: string) => {
            // Admins/managers can join any order
            if (isAdmin || isManager) {
                socket.join(`order:${orderId}`);
                console.log(`📦 Manager ${userId} joined order room: ${orderId}`);
                return;
            }

            // Regular users: verify they own this order
            try {
                const order = await prisma.order.findUnique({
                    where: { id: orderId },
                    select: { userId: true },
                });
                if (order?.userId === userId) {
                    socket.join(`order:${orderId}`);
                    console.log(`📦 User ${userId} joined order room: ${orderId}`);
                } else {
                    socket.emit('error', { message: 'Accès non autorisé à cette commande' });
                }
            } catch {
                socket.emit('error', { message: 'Erreur de vérification' });
            }
        });

        socket.on('leave_order', (orderId: string) => {
            socket.leave(`order:${orderId}`);
        });

        // Handle chat messages
        socket.on('send_message', async (data: { orderId: string; content: string }) => {
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

/**
 * Emit event to all managers/admins
 */
export const emitToManagers = (event: string, data: any): void => {
    if (io) {
        io.to('managers').emit(event, data);
    }
};
