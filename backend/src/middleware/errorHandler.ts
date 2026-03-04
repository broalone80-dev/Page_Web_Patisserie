import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/errors';
import { sendError } from '@utils/responses';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ERROR]', err);

  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  sendError(res, 500, 'Internal Server Error', err.message);
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
};
