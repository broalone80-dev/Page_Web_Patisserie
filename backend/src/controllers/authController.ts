import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/authService';
import { sendSuccess, sendError } from '@utils/responses';

/**
 * Auth Controller – Registration, Login, Refresh, Forgot/Reset Password
 */
export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, 201, 'Inscription réussie', result);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        next(error);
      }
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, 200, 'Connexion réussie', result);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        next(error);
      }
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshAccessToken(refreshToken);
      sendSuccess(res, 200, 'Token rafraîchi', result);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        next(error);
      }
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      sendSuccess(res, 200, 'Déconnexion réussie');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, 200, result.message);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.statusCode, error.message);
      } else {
        next(error);
      }
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const user = await AuthService.getUserById(userId);
      if (!user) {
        sendError(res, 404, 'Utilisateur non trouvé');
        return;
      }
      sendSuccess(res, 200, 'Profil récupéré', { user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const user = await AuthService.updateProfile(userId, req.body);
      sendSuccess(res, 200, 'Profil mis à jour', { user });
    } catch (error) {
      next(error);
    }
  }
}
