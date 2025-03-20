import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = {
  // Auth related
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    return response.data;
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  },
  
  sendPasswordResetEmail: async (email: string) => {
    const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, { token, password });
    return response.data;
  },
  
  // User related
  getUsers: async () => {
    const response = await axios.get(`${API_URL}/api/admin/users`);
    return response.data;
  },
  
  // Email related
  sendOrderConfirmationEmail: async (orderId: string, userId: string) => {
    const response = await axios.post(`${API_URL}/api/admin/emails/order-confirmation`, { orderId, userId });
    return response.data;
  },
  
  sendOrderShippedEmail: async (orderId: string, userId: string, trackingNumber: string) => {
    const response = await axios.post(`${API_URL}/api/admin/emails/order-shipped`, { 
      orderId, 
      userId, 
      trackingNumber 
    });
    return response.data;
  },
  
  sendWelcomeEmail: async (userId: string) => {
    const response = await axios.post(`${API_URL}/api/admin/emails/welcome`, { userId });
    return response.data;
  },
  
  sendNewsletter: async (subject: string, template: string, data: any) => {
    const response = await axios.post(`${API_URL}/api/admin/emails/newsletter`, {
      subject,
      template,
      data
    });
    return response.data;
  },
  
  // Products related
  getProducts: async (params?: any) => {
    const response = await axios.get(`${API_URL}/api/products`, { params });
    return response.data;
  },
  
  getProductBySlug: async (slug: string) => {
    const response = await axios.get(`${API_URL}/api/products/${slug}`);
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await axios.get(`${API_URL}/api/products/${id}`);
    return response.data;
  },
  
  // Categories related
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/api/categories`);
    return response.data;
  },
  
  // Custom prints related
  calculateCustomPrint: async (data: any) => {
    const response = await axios.post(`${API_URL}/api/custom-prints/calculate`, data);
    return response.data;
  },
  
  createCustomPrint: async (data: any) => {
    const response = await axios.post(`${API_URL}/api/custom-prints`, data);
    return response.data;
  },
  
  // Cart related
  getCart: async () => {
    const response = await axios.get(`${API_URL}/api/cart`);
    return response.data;
  },
  
  addToCart: async (productId: string | number, quantity: number, customData?: any) => {
    const payload = { productId, quantity, ...(customData ? { customData } : {}) };
    const response = await axios.post(`${API_URL}/api/cart`, payload);
    return response.data;
  },
  
  removeFromCart: async (itemId: number) => {
    const response = await axios.delete(`${API_URL}/api/cart/${itemId}`);
    return response.data;
  },
  
  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await axios.put(`${API_URL}/api/cart/${itemId}`, { quantity });
    return response.data;
  },
  
  clearCart: async () => {
    const response = await axios.delete(`${API_URL}/api/cart`);
    return response.data;
  }
};

export default apiClient; 