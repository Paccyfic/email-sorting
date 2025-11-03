import axios from 'axios';

// Hit backend directly without proxy
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_URL}/api`;

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const authApi = {
  getCurrentUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
  // Use absolute URL to hit backend directly
  getGoogleAuthUrl: () => `${BASE_URL}/auth/google`,
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; description: string; color?: string }) =>
    api.post('/categories', data),
  update: (id: string, data: Partial<{ name: string; description: string; color: string }>) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Emails
export const emailsApi = {
  getAll: (params?: {
    categoryId?: string;
    accountEmail?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/emails', { params }),
  getById: (id: string) => api.get(`/emails/${id}`),
  getByCategory: (categoryId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/emails/category/${categoryId}`, { params }),
  delete: (id: string) => api.delete(`/emails/${id}`),
  bulkDelete: (emailIds: string[]) => api.post('/emails/bulk-delete', { emailIds }),
};

// Processing
export const processApi = {
  syncEmails: (maxResults?: number, includeSpam?: boolean, includeTrash?: boolean) =>
    api.post('/process/sync', { maxResults, includeSpam, includeTrash }),
  categorizeEmail: (emailId: string) => api.post('/process/categorize', { emailId }),
  unsubscribe: (emailId: string) => api.post('/process/unsubscribe', { emailId }),
  bulkUnsubscribe: (emailIds: string[]) =>
    api.post('/process/bulk-unsubscribe', { emailIds }),
};
