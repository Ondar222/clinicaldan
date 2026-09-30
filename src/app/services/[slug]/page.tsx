import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ServicePage from '@/components/ServicePage';
import { pageMeta } from '@/app/seo';

// Прежний SSR: для /services/:slug метаданные раздела /services (prefix-match).
export const metadata: Metadata = pageMeta('/services', '/services');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ServicePage />
    </Suspense>
  );
}
