// ============================================================
// API Endpoint Constants
// ============================================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  TRAINS: {
    BASE: '/trains',
    SEARCH: '/trains/search',
    DETAILS: (id: string) => `/trains/${id}`,
    AVAILABILITY: (id: string) => `/trains/${id}/availability`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    CREATE: '/bookings',
    DETAILS: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    HISTORY: '/bookings/history',
  },
  PAYMENTS: {
    BASE: '/payments',
    CREATE: '/payments',
    VERIFY: (id: string) => `/payments/${id}/verify`,
    REFUND: (id: string) => `/payments/${id}/refund`,
  },
  PNR: {
    STATUS: (pnr: string) => `/pnr/${pnr}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
} as const;
