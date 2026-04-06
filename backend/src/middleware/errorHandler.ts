import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/errors';
import { sendError } from '@utils/responses';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ERROR]', err);

  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // NEVER leak internal error messages in production
  sendError(res, 500, 'Internal Server Error', isProduction ? undefined : err.message);
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
};
