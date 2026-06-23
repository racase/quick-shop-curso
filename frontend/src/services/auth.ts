import axios from 'axios';
import { LoginRequest, RegisterRequest, LoginResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<void> {
    await api.post('/auth/register', data);
  },

  async refresh(token: string): Promise<{ access_token: string; token_type: string }> {
    const response = await api.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default api;
