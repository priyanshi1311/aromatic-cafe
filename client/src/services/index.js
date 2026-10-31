import api from './api';

export const bookingService = {
  getSlots: (date, guests) => api.get(`/bookings/slots?date=${date}&guests=${guests || 1}`),
  createBooking: (data) => api.post('/bookings', data),
  getBookingConfirmation: (bookingId) => api.get(`/bookings/confirm/${bookingId}`),
  // Admin
  getBookings: (params) => api.get('/bookings', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  getDashboardStats: () => api.get('/bookings/dashboard'),
  exportCSV: (params) => api.get('/bookings/export', { params, responseType: 'blob' }),
};

export const tableService = {
  getPublicTables: () => api.get('/tables/public'),
  getTables: () => api.get('/tables'),
  createTable: (data) => api.post('/tables', data),
  updateTable: (id, data) => api.put(`/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/tables/${id}`),
  getTableQR: (id) => api.get(`/tables/${id}/qr`),
  getRestaurantQR: () => api.get('/tables/restaurant-qr'),
};

export const customerService = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  createCustomer: (data) => api.post('/customers', data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  exportCSV: (params) => api.get('/customers/export', { params, responseType: 'blob' }),
};

export const settingsService = {
  getPublicSettings: () => api.get('/settings/public'),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  addBlockedDate: (date) => api.post('/settings/blocked-dates', { date }),
  removeBlockedDate: (date) => api.delete(`/settings/blocked-dates/${date}`),
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};
