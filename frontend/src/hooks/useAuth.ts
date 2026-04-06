import { useEffect, useState } from 'react';
import { useAuthStore } from '@lib/authStore';
import { authService } from '@services/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken, refreshToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const res = await authService.getProfile();
          const userData = res.data?.user || res.data || res;
          setAuth(userData, accessToken, refreshToken || '');
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
      const data = result.data || result;
      setAuth(data.user, data.accessToken, data.refreshToken);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const result = await authService.register(email, password, fullName, phone);
      const data = result.data || result;
      setAuth(data.user, data.accessToken, data.refreshToken);
      return data;
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
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    logout,
  };
};
