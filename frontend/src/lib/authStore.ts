import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  isManager: boolean;
  avatarUrl?: string | null;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isAuthenticated: () => boolean;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,

  setAuth: (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  isAdmin: () => {
    return get().user?.isAdmin ?? false;
  },

  isManager: () => {
    return get().user?.isManager ?? false;
  },

  isAuthenticated: () => {
    return !!get().accessToken && !!get().user;
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
}));

// Initialize from localStorage on mount
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('accessToken');
  const storedRefresh = localStorage.getItem('refreshToken');

  if (storedUser && storedToken) {
    try {
      useAuthStore.setState({
        user: JSON.parse(storedUser),
        accessToken: storedToken,
        refreshToken: storedRefresh,
      });
    } catch (e) {
      console.error('Failed to parse stored auth:', e);
    }
  }
}
