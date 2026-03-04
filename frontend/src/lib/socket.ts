import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection with auth token
 */
export const connectSocket = (token: string): Socket => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'], // Fallback for unstable connections
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 15000,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected');
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error.message);
    });

    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Join an order's chat room
 */
export const joinOrderRoom = (orderId: string): void => {
    socket?.emit('join_order', orderId);
};

/**
 * Leave an order's chat room
 */
export const leaveOrderRoom = (orderId: string): void => {
    socket?.emit('leave_order', orderId);
};

/**
 * Send typing indicator
 */
export const sendTyping = (orderId: string): void => {
    socket?.emit('typing', { orderId });
};
