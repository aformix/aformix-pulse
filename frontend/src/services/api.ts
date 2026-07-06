import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: silently refresh access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  googleAuth: (token: string) =>
    api.post('/auth/google', { token }),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  getMe: () =>
    api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// ─── Projects API ─────────────────────────────────────────────────────────────

export interface Project {
  _id: string;
  userId: string;
  name: string;
  domain: string;
  status: 'active' | 'paused' | 'archived';
  crawlFrequency: 'daily' | 'weekly' | 'manual';
  lastCrawledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  domain: string;
  crawlFrequency?: 'daily' | 'weekly' | 'manual';
}

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>('/projects'),
  get: (id: string) => api.get<{ project: Project }>(`/projects/${id}`),
  create: (data: CreateProjectPayload) => api.post<{ project: Project }>('/projects', data),
  update: (id: string, data: Partial<CreateProjectPayload & { status: Project['status'] }>) =>
    api.put<{ project: Project }>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  triggerCrawl: (id: string) =>
    api.post<{ jobId: string; projectId: string }>(`/projects/${id}/crawl`),
};

// ─── Crawl Results API ────────────────────────────────────────────────────────

export interface CrawlResult {
  _id: string;
  projectId: string;
  userId: string;
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  wordCount: number;
  loadTimeMs: number;
  error?: string;
  createdAt: string;
}

export interface CrawlResultPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const crawlResultsApi = {
  list: (projectId: string, page = 1, limit = 20) =>
    api.get<{ results: CrawlResult[]; pagination: CrawlResultPagination }>(
      `/projects/${projectId}/crawl-results`,
      { params: { page, limit } }
    ),
  get: (resultId: string) =>
    api.get<{ result: CrawlResult & { links: { href: string; text: string; isInternal: boolean }[] } }>(
      `/crawl-results/${resultId}`
    ),
};

// ─── User API ─────────────────────────────────────────────────────────────

export const userApi = {
  updateProfile: (data: { name: string; email: string }) =>
    api.put<{ message: string; user: { id: string; name: string; email: string; avatar?: string } }>('/user/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/user/password', data),
  deleteAccount: () =>
    api.delete<{ message: string }>('/user/account'),
};

export default api;

