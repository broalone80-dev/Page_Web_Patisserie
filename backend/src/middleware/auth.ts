import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index';
import { verifyAccessToken } from '@utils/jwt';
import { sendError } from '@utils/responses';

/**
 * JWT Authentication Middleware
 * Validates Bearer token in Authorization header
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    sendError(res, 401, 'Access token required');
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    sendError(res, 401, 'Invalid or expired token');
    return;
  }

  req.user = payload;
  next();
};

/**
 * Admin Role Middleware
 * Must be called after authenticateToken
 */
export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isAdmin) {
    sendError(res, 403, 'Admin privileges required');
    return;
  }
  next();
};

/**
 * Manager or Admin Role Middleware
 * Must be called after authenticateToken
 */
export const authorizeManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isAdmin && !req.user?.isManager) {
    sendError(res, 403, 'Accès réservé aux gestionnaires');
    return;
  }
  next();
};

/**
 * Optional authentication - user can be null
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};
