import { z } from 'zod';

/**
 * Auth Zod schemas – strict validation for all auth inputs
 */

export const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z
        .string()
        .min(8, 'Mot de passe: 8 caractères minimum')
        .max(100)
        .regex(/[A-Z]/, 'Doit contenir une majuscule')
        .regex(/[0-9]/, 'Doit contenir un chiffre'),
    fullName: z.string().min(2).max(100).optional(),
    phone: z
        .string()
        .regex(/^\+?[0-9]{9,15}$/, 'Numéro de téléphone invalide')
        .optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requis'),
    password: z
        .string()
        .min(8, 'Mot de passe: 8 caractères minimum')
        .max(100)
        .regex(/[A-Z]/, 'Doit contenir une majuscule')
        .regex(/[0-9]/, 'Doit contenir un chiffre'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
