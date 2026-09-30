'use client';

/**
 * Совместимость с API react-router-dom поверх Next.js App Router.
 *
 * Фронтенд мигрирован с Vite + react-router без переписывания тел компонентов,
 * поэтому здесь переэкспортируются привычные сущности:
 *   Link (проп `to` вместо `href`), useNavigate, useParams, useSearchParams, useLocation.
 *
 * Импорты в компонентах изменены только с "react-router-dom" на "@/lib/navigation".
 */

import { useCallback, useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import NextLink from 'next/link';
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

type NextLinkProps = ComponentProps<typeof NextLink>;

export interface LinkProps extends Omit<NextLinkProps, 'href'> {
  to: string;
  children?: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}

export default Link;

/**
 * Аналог useNavigate() из react-router.
 * Поддерживает вызовы navigate('/path'), navigate(-1) и navigate('/path', { replace: true }).
 */
export function useNavigate() {
  const router = useRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  );
}

/** Аналог useParams<T>() — сегменты динамических маршрутов. */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const params = useNextParams();
  const normalized: Record<string, string> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      normalized[key] = Array.isArray(value) ? value.join('/') : String(value);
    }
  }
  return normalized as T;
}

/**
 * Аналог useSearchParams() — возвращает кортеж, чтобы не менять
 * деструктуризацию `const [searchParams] = useSearchParams()` в компонентах.
 */
export function useSearchParams(): [URLSearchParams] {
  const params = useNextSearchParams();
  return [new URLSearchParams(params ? params.toString() : '')];
}

/**
 * Аналог useLocation() — нужен для ScrollToTop и SeoHead.
 * ВАЖНО: не использует useSearchParams() намеренно — иначе каждая страница
 * с SeoHead попадает в CSR-bailout и `next build` падает на пререндере.
 * search читается с client-side (после монтирования), pathname — родной хук.
 */
export function useLocation() {
  const pathname = usePathname() ?? '';
  const [search, setSearch] = useState('');
  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);
  return { pathname, search, hash: '' };
}
