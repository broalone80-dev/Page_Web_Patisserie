import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
    timestamp: new Date().toISOString(),
  });
};
