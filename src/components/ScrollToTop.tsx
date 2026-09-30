'use client';
import { useEffect } from 'react';
import { useLocation } from '@/lib/navigation';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on any route change
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}


