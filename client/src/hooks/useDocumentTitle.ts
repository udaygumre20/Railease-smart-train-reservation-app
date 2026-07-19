import { useEffect, useRef } from 'react';
import { APP_NAME } from '@/constants/app.constants';

// ============================================================
// useDocumentTitle — set document.title reactively
// ============================================================

export function useDocumentTitle(title: string): void {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = defaultTitle.current;
    };
  }, [title]);
}
