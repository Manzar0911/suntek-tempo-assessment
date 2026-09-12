import type { User } from '@/models';
import { request } from './api';
export const authService = {
  me: () => request<User>('/auth/me'),
  login: (data: { email: string; password: string }) => request<User>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  signup: (data: { name: string; email: string; password: string }) => request<User>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' })
};
