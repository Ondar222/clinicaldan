'use client';

import { useEffect } from 'react';

// Аналог прежнего RouteErrorBoundary из App.tsx (Vite + react-router).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-gray-50 py-12 px-4 text-center">
      <h1 className="text-2xl font-bold text-dark">Что-то пошло не так</h1>
      <p className="text-gray-600 text-sm max-w-md">
        При загрузке страницы произошла ошибка. Попробуйте обновить страницу.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-md font-medium transition-colors"
      >
        Обновить страницу
      </button>
    </div>
  );
}