import { useState, useEffect } from 'react';
import { DEBOUNCE } from '@/constants/app.constants';

// ============================================================
// useDebounce — debounce a rapidly-changing value
// ============================================================

export function useDebounce<T>(value: T, delay: number = DEBOUNCE.SEARCH): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
