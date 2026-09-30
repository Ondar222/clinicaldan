'use client';
/**
 * Предварительная загрузка врачей и услуг (кэш Archimed).
 * В прежнем src/App.tsx вызывался в useEffect на монтировании приложения.
 */
import { useEffect } from 'react';
import archimedService from '@/services/archimed';

export default function AppPrefetch() {
  useEffect(() => {
    archimedService.prefetchAll();
  }, []);

  return null;
}
