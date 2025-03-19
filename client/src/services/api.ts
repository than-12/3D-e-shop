import axios from 'axios';

// Διόρθωση για Vite: χρήση import.meta.env αντί για process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Δημιουργία instance του axios με βασικές ρυθμίσεις
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor για προσθήκη του token σε κάθε αίτημα
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

// Υπηρεσίες αυθεντικοποίησης
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// Υπηρεσίες για τα μηνύματα
export const messagesAPI = {
  getAll: async () => {
    const response = await api.get('/api/messages');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/messages/${id}`);
    return response.data;
  },
  
  create: async (messageData: { title: string; content: string; categoryId?: string }) => {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  },
  
  update: async (id: string, messageData: { title?: string; content?: string; categoryId?: string }) => {
    const response = await api.put(`/api/messages/${id}`, messageData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/messages/${id}`);
    return response.data;
  }
};

// Υπηρεσίες για τις κατηγορίες
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },
  
  create: async (categoryData: { name: string; description?: string }) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },
  
  update: async (id: string, categoryData: { name?: string; description?: string }) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  }
};

// Υπηρεσίες για διαχειριστή
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
  
  getUserById: async (id: string) => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id: string, userData: { name?: string; email?: string; role?: string }) => {
    const response = await api.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  }
};

// Υπηρεσίες για τα προϊόντα
export const productsAPI = {
  getAll: async (params?: { 
    category?: string; 
    featured?: boolean; 
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  
  create: async (productData: { 
    name: string; 
    price: number;
    stock?: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
    discount?: number;
  }) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },
  
  update: async (id: string, productData: { 
    name?: string; 
    price?: number;
    stock?: number;
    categoryId?: string;
    description?: string;
    imageUrl?: string;
    featured?: boolean;
    discount?: number;
  }) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};

export default api; 