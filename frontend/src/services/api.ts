import axios from 'axios';

// Use relative URL in development (with Vite proxy) or absolute URL in production
const API_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:8090/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          if (response.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  emailVerified: boolean;
  role: string;
  status: string;
  provider?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Mood Diary Types
export enum MoodType {
  VERY_HAPPY = 'VERY_HAPPY',
  HAPPY = 'HAPPY',
  CONTENT = 'CONTENT',
  NEUTRAL = 'NEUTRAL',
  ANXIOUS = 'ANXIOUS',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  DEPRESSED = 'DEPRESSED',
  EXCITED = 'EXCITED',
  TIRED = 'TIRED'
}

export interface MoodDiaryRequest {
  title: string;
  content?: string;
  mood: MoodType;
  moodIntensity: number;
  tags?: string[];
  weather?: string;
  location?: string;
  isPrivate?: boolean;
}

export interface MoodDiaryResponse {
  id: number;
  title: string;
  content?: string;
  mood: MoodType;
  moodIntensity: number;
  tags?: string[];
  weather?: string;
  location?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  moodKoreanName: string;
  moodEmoji: string;
  moodColor: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const authAPI = {
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => 
    api.post('/auth/login', data).then(res => res.data),
  
  signup: (data: SignupRequest): Promise<ApiResponse<AuthResponse>> => 
    api.post('/auth/signup', data).then(res => res.data),
  
  checkEmailAvailability: (email: string): Promise<ApiResponse<boolean>> =>
    api.get(`/auth/check-email?email=${email}`).then(res => res.data),
  
  verifyEmail: (token: string): Promise<ApiResponse<string>> => 
    api.get(`/auth/verify-email?token=${token}`).then(res => res.data),
  
  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/refresh', { refreshToken }).then(res => res.data),
  
  logout: (refreshToken: string): Promise<ApiResponse<string>> =>
    api.post('/auth/logout', { refreshToken }).then(res => res.data),
};

export const moodDiaryAPI = {
  // 일기 생성
  createDiary: (data: MoodDiaryRequest): Promise<ApiResponse<MoodDiaryResponse>> =>
    api.post('/mood-diaries', data).then(res => res.data),
  
  // 일기 목록 조회
  getDiaries: (page = 0, size = 10): Promise<ApiResponse<PageResponse<MoodDiaryResponse>>> =>
    api.get(`/mood-diaries?page=${page}&size=${size}`).then(res => res.data),
  
  // 일기 상세 조회
  getDiary: (id: number): Promise<ApiResponse<MoodDiaryResponse>> =>
    api.get(`/mood-diaries/${id}`).then(res => res.data),
  
  // 일기 수정
  updateDiary: (id: number, data: MoodDiaryRequest): Promise<ApiResponse<MoodDiaryResponse>> =>
    api.put(`/mood-diaries/${id}`, data).then(res => res.data),
  
  // 일기 삭제
  deleteDiary: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/mood-diaries/${id}`).then(res => res.data),
  
  // 기분별 일기 조회
  getDiariesByMood: (mood: MoodType, page = 0, size = 10): Promise<ApiResponse<PageResponse<MoodDiaryResponse>>> =>
    api.get(`/mood-diaries/mood/${mood}?page=${page}&size=${size}`).then(res => res.data),
  
  // 일기 검색
  searchDiaries: (keyword: string, page = 0, size = 10): Promise<ApiResponse<PageResponse<MoodDiaryResponse>>> =>
    api.get(`/mood-diaries/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`).then(res => res.data),
  
  // 최근 일기 조회
  getRecentDiaries: (): Promise<ApiResponse<MoodDiaryResponse[]>> =>
    api.get('/mood-diaries/recent').then(res => res.data),
  
  // 기간별 일기 조회
  getDiariesByDateRange: (startDate: string, endDate: string): Promise<ApiResponse<MoodDiaryResponse[]>> =>
    api.get(`/mood-diaries/date-range?startDate=${startDate}&endDate=${endDate}`).then(res => res.data),
  
  // 일기 통계
  getDiaryStats: (): Promise<ApiResponse<any>> =>
    api.get('/mood-diaries/stats').then(res => res.data),
};

export default api;