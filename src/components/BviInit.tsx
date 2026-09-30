'use client';

import { useEffect } from 'react';

/**
 * Инициализация виджета «Версия для слабовидящих» (пакет bvi).
 * В Vite вызывался глобально в main.tsx; в Next.js — на клиенте после монтирования.
 */
export default function BviInit() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await import('bvi');
        const Bvi = mod.Bvi ?? mod.default?.Bvi;
        if (!cancelled && typeof Bvi === 'function') {
          new Bvi();
        }
      } catch (error) {
        console.error('bvi init failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
