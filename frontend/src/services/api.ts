import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15s timeout for slow connections (Cameroon)
});

// ============================================
// INTERCEPTORS – Token management & refresh
// ============================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newAccessToken = data.data?.accessToken || data.accessToken;
          const newRefreshToken = data.data?.refreshToken || data.refreshToken;

          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          isRefreshing = false;
          onTokenRefreshed(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch {
          isRefreshing = false;
          localStorage.clear();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }
      }

      // Queue requests while refreshing
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  async register(email: string, password: string, fullName?: string, phone?: string) {
    const { data } = await apiClient.post('/auth/register', { email, password, fullName, phone });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => { });
    localStorage.clear();
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },

  async getProfile() {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  async updateProfile(profileData: { fullName?: string; phone?: string }) {
    const { data } = await apiClient.put('/auth/profile', profileData);
    return data;
  },
};

// ============================================
// PRODUCT SERVICE
// ============================================

export const productService = {
  async getAll(page = 1, limit = 20) {
    const { data } = await apiClient.get('/products', { params: { page, limit } });
    return data;
  },

  async getBySlug(slug: string) {
    const { data } = await apiClient.get(`/products/${slug}`);
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  async getFeatured() {
    const { data } = await apiClient.get('/products', { params: { featured: true } });
    return data;
  },
};

// ============================================
// CATEGORY SERVICE
// ============================================

export const categoryService = {
  async getAll() {
    const { data } = await apiClient.get('/categories');
    return data;
  },

  async getBySlug(slug: string) {
    const { data } = await apiClient.get(`/categories/${slug}`);
    return data;
  },
};

// ============================================
// ORDER SERVICE
// ============================================

export const orderService = {
  async create(orderData: {
    items: Array<{ productId: string; quantity: number }>;
    fulfillment: string;
    addressId?: string;
    notes?: string;
  }) {
    const { data } = await apiClient.post('/orders', orderData);
    return data;
  },

  async getAll(page = 1, limit = 10) {
    const { data } = await apiClient.get('/orders', { params: { page, limit } });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },
};

// ============================================
// CHAT SERVICE
// ============================================

export const chatService = {
  async getMessages(orderId: string, page = 1) {
    const { data } = await apiClient.get(`/chat/${orderId}/messages`, { params: { page } });
    return data;
  },

  async sendMessage(orderId: string, content: string) {
    const { data } = await apiClient.post(`/chat/${orderId}/messages`, { content });
    return data;
  },

  async markAsRead(orderId: string) {
    const { data } = await apiClient.put(`/chat/${orderId}/read`);
    return data;
  },

  async getUnreadCounts() {
    const { data } = await apiClient.get('/chat/unread');
    return data;
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  async getAll(page = 1) {
    const { data } = await apiClient.get('/notifications', { params: { page } });
    return data;
  },

  async getUnreadCount() {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },

  async markAsRead(notificationIds?: string[]) {
    const { data } = await apiClient.put('/notifications/read', { notificationIds });
    return data;
  },
};

// ============================================
// ADMIN SERVICE
// ============================================

export const adminService = {
  async getDashboard() {
    const { data } = await apiClient.get('/admin/dashboard');
    return data;
  },

  async getUsers(page = 1, limit = 20, search?: string) {
    const { data } = await apiClient.get('/admin/users', { params: { page, limit, search } });
    return data;
  },

  async toggleUserStatus(id: string) {
    const { data } = await apiClient.put(`/admin/users/${id}/toggle-status`);
    return data;
  },

  async getOrders(page = 1, limit = 20, status?: string) {
    const { data } = await apiClient.get('/admin/orders', { params: { page, limit, status } });
    return data;
  },

  async updateOrderStatus(id: string, status: string) {
    const { data } = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return data;
  },

  async createProduct(product: any) {
    const { data } = await apiClient.post('/admin/products', product);
    return data;
  },

  async updateProduct(id: string, product: any) {
    const { data } = await apiClient.put(`/admin/products/${id}`, product);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await apiClient.delete(`/admin/products/${id}`);
    return data;
  },

  async addProductImages(productId: string, images: any[]) {
    const { data } = await apiClient.post(`/admin/products/${productId}/images`, { images });
    return data;
  },
};

// ============================================
// UPLOAD SERVICE
// ============================================

export const uploadService = {
  async uploadSingle(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder },
    });
    return data;
  },

  async uploadMultiple(files: File[], folder?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const { data } = await apiClient.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { folder },
    });
    return data;
  },

  async deleteImage(publicId: string) {
    const { data } = await apiClient.delete(`/upload/${publicId}`);
    return data;
  },
};

export default apiClient;
