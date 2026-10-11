import axios from 'axios';
import type { AnalysisFormData, Analysis, FullReport } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

// Analyses
export const analysisApi = {
  create: async (data: AnalysisFormData) => {
    const res = await api.post('/analyses', data);
    return res.data.data.analysis as Analysis;
  },
  list: async (page = 1, status?: string) => {
    const params: any = { page, limit: 10 };
    if (status) params.status = status;
    const res = await api.get('/analyses', { params });
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/analyses/${id}`);
    return res.data.data.analysis as Analysis;
  },
  run: async (id: string) => {
    const res = await api.post(`/analyses/${id}/run`);
    return res.data.data;
  },
  status: async (id: string) => {
    const res = await api.get(`/analyses/${id}/status`);
    return res.data.data;
  },
  report: async (id: string) => {
    const res = await api.get(`/analyses/${id}/report`);
    return res.data.data as FullReport;
  },
  refine: async (id: string) => {
    const res = await api.post(`/analyses/${id}/refine`);
    return res.data.data;
  },
  feasibility: async (id: string) => {
    const res = await api.get(`/analyses/${id}/feasibility`);
    return res.data.data.feasibility;
  },
  updateAssumptions: async (id: string, assumptions: Record<string, any>) => {
    const res = await api.patch(`/analyses/${id}/assumptions`, { assumptions });
    return res.data.data;
  },
  recalculate: async (id: string) => {
    const res = await api.post(`/analyses/${id}/recalculate`);
    return res.data.data.budgetBreakdown;
  },
  getEquipment: async (id: string) => {
    const res = await api.get(`/analyses/${id}/equipment`);
    return res.data.data.equipment;
  },
  updateEquipment: async (id: string, items: any[]) => {
    const res = await api.patch(`/analyses/${id}/equipment`, { items });
    return res.data.data.equipment;
  },
  getLicenses: async (id: string) => {
    const res = await api.get(`/analyses/${id}/licenses`);
    return res.data.data.licenses;
  },
  getComplianceReport: async (id: string) => {
    const res = await api.get(`/analyses/${id}/compliance-report`);
    return res.data.data;
  },
  getRoadmap: async (id: string) => {
    const res = await api.get(`/analyses/${id}/roadmap`);
    return res.data.data;
  },
  compareSuppliers: async (id: string) => {
    const res = await api.post(`/analyses/${id}/suppliers/compare`);
    return res.data.data.comparison;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/analyses/${id}`);
    return res.data.data;
  },
};

// Profile
export const profileApi = {
  get: async () => {
    const res = await api.get('/profile');
    return res.data.data;
  },
  update: async (name: string) => {
    const res = await api.patch('/profile', { name });
    return res.data.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.patch('/profile/password', { currentPassword, newPassword });
    return res.data.data;
  },
};

// Compliance tasks
export const complianceApi = {
  update: async (id: string, data: { status?: string; notes?: string; dueDate?: string }) => {
    const res = await api.patch(`/compliance-tasks/${id}`, data);
    return res.data.data.task;
  },
};

// Setup tasks
export const setupTaskApi = {
  update: async (id: string, data: { status?: string; notes?: string }) => {
    const res = await api.patch(`/setup-tasks/${id}`, data);
    return res.data.data.task;
  },
};

// Equipment catalog
export const equipmentCatalogApi = {
  search: async (params: { search?: string; category?: string; industry?: string; page?: number }) => {
    const res = await api.get('/equipment', { params });
    return res.data.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/equipment/${id}`);
    return res.data.data.equipment;
  },
};

// License search
export const licenseSearchApi = {
  search: async (params: { search?: string; industry?: string; jurisdiction?: string; state?: string }) => {
    const res = await api.get('/licenses/search', { params });
    return res.data.data;
  },
};

export default api;
