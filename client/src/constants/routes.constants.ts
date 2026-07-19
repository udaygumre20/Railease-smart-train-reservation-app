// ============================================================
// Route Path Constants
// ============================================================

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Main App (Protected)
  DASHBOARD: '/dashboard',
  SEARCH: '/search',
  TRAINS: '/trains',
  TRAIN_DETAILS: '/trains/:trainId',
  BOOKING: '/booking',
  BOOKING_DETAILS: '/booking/:bookingId',
  BOOKING_SEATS: '/booking/:bookingId/seats',
  PAYMENT: '/payment/:bookingId',
  PAYMENT_SUCCESS: '/payment/success',
  TICKETS: '/tickets',
  TICKET_DETAILS: '/tickets/:ticketId',
  PNR_STATUS: '/pnr-status',

  // User
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  NOTIFICATIONS: '/notifications',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRAINS: '/admin/trains',
  ADMIN_BOOKINGS: '/admin/bookings',

  // Error
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
