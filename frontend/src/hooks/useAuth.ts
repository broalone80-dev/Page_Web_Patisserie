import { useEffect, useState } from 'react';
import { useAuthStore } from '@lib/authStore';
import { authService } from '@services/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const userData = await authService.getMe();
          setAuth(userData, accessToken);
        } catch (error) {
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setAuth(result.user, result.accessToken);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const result = await authService.register(email, password, fullName, phone);
      setAuth(result.user, result.accessToken);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!accessToken,
    login,
    register,
    logout,
  };
};
