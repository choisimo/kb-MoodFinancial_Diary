import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  nickname: string;
  emailVerified: boolean;
}

export const authAPI = {
  signup: (data: SignupRequest): Promise<AuthResponse> => 
    api.post('/auth/signup', data).then(res => res.data),
  
  login: (data: LoginRequest): Promise<AuthResponse> => 
    api.post('/auth/login', data).then(res => res.data),
  
  verifyEmail: (token: string): Promise<string> => 
    api.get(`/auth/verify-email?token=${token}`).then(res => res.data),
};

export default api;