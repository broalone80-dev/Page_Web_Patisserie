import prisma from '@config/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@utils/jwt';
import { ApiError } from '@utils/errors';
import { sendPasswordResetEmail } from './emailService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Auth Service – Complete auth with refresh tokens and forgot password
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(400, 'Email déjà enregistré');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.fullName || null,
        phone: data.phone || null,
        isAdmin: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isAdmin: true,
        isManager: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Email ou mot de passe invalide');
    }

    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Email ou mot de passe invalide');
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        isAdmin: user.isAdmin,
        isManager: user.isManager,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string) {
    // Verify token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new ApiError(401, 'Refresh token invalide ou expiré');
    }

    // Check if token exists in DB and not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ApiError(401, 'Refresh token invalide ou expiré');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, isAdmin: true, isManager: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Utilisateur désactivé');
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
    });
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout – invalidate refresh token
   */
  static async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Forgot password – send reset email
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    // Generate reset token
    const token = uuidv4();

    // Invalidate previous reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new reset token (1 hour expiry)
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new ApiError(400, 'Token invalide ou expiré');
    }

    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Invalidate all refresh tokens for this user (force re-login)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isAdmin: true,
        isManager: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(id: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isAdmin: true,
        isManager: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }
}
