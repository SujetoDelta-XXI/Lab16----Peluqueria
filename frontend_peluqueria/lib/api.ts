import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Para enviar cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  googleAuth: () => `${API_URL}/auth/google`,
  getPublicServices: () => api.get('/auth/services'),
};

// Client endpoints
export const clientAPI = {
  getServices: () => api.get('/client/services'),
  getHairstylists: (serviceId: string) => api.get(`/client/hairstylists?serviceId=${serviceId}`),
  getAvailability: (hairstylistId: string, date: string, serviceId: string) =>
    api.get(`/client/availability?hairstylistId=${hairstylistId}&date=${date}&serviceId=${serviceId}`),
  createAppointment: (data: any) => api.post('/client/appointments', data),
  getAppointments: (filter?: 'upcoming' | 'history') =>
    api.get(`/client/appointments${filter ? `?filter=${filter}` : ''}`),
  getAppointmentDetail: (id: string) => api.get(`/client/appointments/${id}`),
  cancelAppointment: (id: string, motivo?: string) =>
    api.patch(`/client/appointments/${id}/cancel`, { motivo }),
  updateProfile: (data: any) => api.patch('/client/profile', data),
  changePassword: (data: any) => api.patch('/client/change-password', data),
};

// Hairstylist endpoints
export const hairstylistAPI = {
  getAgenda: (date?: string, view?: 'day' | 'week') =>
    api.get(`/hairstylist/agenda${date ? `?date=${date}` : ''}${view ? `&view=${view}` : ''}`),
  getAppointmentDetail: (id: string) => api.get(`/hairstylist/appointments/${id}`),
  completeAppointment: (id: string) => api.patch(`/hairstylist/appointments/${id}/complete`),
  markNoShow: (id: string) => api.patch(`/hairstylist/appointments/${id}/no-show`),
  getProfile: () => api.get('/hairstylist/profile'),
  changePassword: (data: any) => api.patch('/hairstylist/change-password', data),
};

// Admin endpoints
export const adminAPI = {
  // Services
  getServices: () => api.get('/admin/services'),
  createService: (data: any) => api.post('/admin/services', data),
  getService: (id: string) => api.get(`/admin/services/${id}`),
  updateService: (id: string, data: any) => api.patch(`/admin/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),
  toggleServiceState: (id: string) => api.patch(`/admin/services/${id}/toggle-state`),

  // Hairstylists
  getHairstylists: (estado?: string) =>
    api.get(`/admin/hairstylists${estado ? `?estado=${estado}` : ''}`),
  createHairstylist: (data: any) => api.post('/admin/hairstylists', data),
  getHairstylist: (id: string) => api.get(`/admin/hairstylists/${id}`),
  updateHairstylist: (id: string, data: any) => api.patch(`/admin/hairstylists/${id}`, data),
  approveHairstylist: (id: string) => api.patch(`/admin/hairstylists/${id}/approve`),
  deactivateHairstylist: (id: string) => api.patch(`/admin/hairstylists/${id}/deactivate`),
  reactivateHairstylist: (id: string) => api.patch(`/admin/hairstylists/${id}/reactivate`),
  deleteHairstylist: (id: string) => api.delete(`/admin/hairstylists/${id}`),

  // Absences
  getAbsences: (peluqueroId?: string) =>
    api.get(`/admin/ausencias${peluqueroId ? `?peluqueroId=${peluqueroId}` : ''}`),
  createAbsence: (data: any) => api.post('/admin/ausencias', data),
  getAbsence: (id: string) => api.get(`/admin/ausencias/${id}`),
  updateAbsence: (id: string, data: any) => api.patch(`/admin/ausencias/${id}`, data),
  deleteAbsence: (id: string) => api.delete(`/admin/ausencias/${id}`),

  // Appointments
  getAppointments: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/admin/appointments${params ? `?${params}` : ''}`);
  },
  getAppointment: (id: string) => api.get(`/admin/appointments/${id}`),
  deleteAppointment: (id: string) => api.delete(`/admin/appointments/${id}`),

  // Clients
  getClients: (search?: string) =>
    api.get(`/admin/clients${search ? `?search=${search}` : ''}`),
  getClient: (id: string) => api.get(`/admin/clients/${id}`),
  updateClient: (id: string, data: any) => api.patch(`/admin/clients/${id}`, data),
  toggleClientState: (id: string) => api.patch(`/admin/clients/${id}/toggle-state`),
  deleteClient: (id: string) => api.delete(`/admin/clients/${id}`),

  // Configuration
  getConfiguration: () => api.get('/admin/configuration'),
  updateConfiguration: (data: any) => api.patch('/admin/configuration', data),
};

// Unified API export with all endpoints
export const API = {
  ...api,
  client: clientAPI,
  hairstylist: hairstylistAPI,
  admin: adminAPI,
};
