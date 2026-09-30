import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CosmetologyPage from '@/components/CosmetologyPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR отдавал для /services/* метаданные раздела /services.
export const metadata: Metadata = pageMeta('/services/cosmetology', '/services');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CosmetologyPage />
    </Suspense>
  );
}
