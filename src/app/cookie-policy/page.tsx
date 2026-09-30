import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CookiePolicyPage from '@/components/CookiePolicyPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/cookie-policy');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CookiePolicyPage />
    </Suspense>
  );
}
