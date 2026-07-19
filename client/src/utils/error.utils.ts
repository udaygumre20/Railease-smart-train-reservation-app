import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

// ============================================================
// Error Handling Utilities
// ============================================================

/** Extract a user-friendly message from any error shape. */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined;
    return data?.message ?? error.message ?? 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/** Extract field-level validation errors from an API 422. */
export function getFieldErrors(error: unknown): Record<string, string[]> | null {
  if (isAxiosError(error) && error.response?.status === 422) {
    const data = error.response.data as Partial<ApiError> | undefined;
    return data?.errors ?? null;
  }
  return null;
}

/** Type guard for Axios errors. */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/** Determine if an error is a network / timeout error. */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response || error.code === 'ECONNABORTED';
  }
  return false;
}
