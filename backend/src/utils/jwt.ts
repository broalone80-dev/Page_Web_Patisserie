import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { config } from '@config/env';
import { AuthPayload } from '@types/index';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
  } catch {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as AuthPayload;
  } catch {
    return null;
  }
};

/**
 * Hash password with bcryptjs
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 12);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};
