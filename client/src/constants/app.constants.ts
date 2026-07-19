// ============================================================
// Application Constants
// ============================================================

export const APP_NAME = 'RailEase' as const;
export const APP_DESCRIPTION = 'Premium Train Reservation System' as const;

/** Keys used for localStorage persistence. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'railease_access_token',
  REFRESH_TOKEN: 'railease_refresh_token',
  THEME: 'railease_theme',
  USER: 'railease_user',
} as const;

/** Default pagination settings. */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 20, 50, 100],
} as const;

/** Date / time display formats. */
export const DATE_FORMATS = {
  DATE: 'DD MMM YYYY',
  DATE_SHORT: 'DD/MM/YYYY',
  TIME: 'HH:mm',
  TIME_12H: 'hh:mm A',
  DATE_TIME: 'DD MMM YYYY, HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/** Debounce delays (ms). */
export const DEBOUNCE = {
  SEARCH: 400,
  RESIZE: 200,
  SCROLL: 100,
} as const;
