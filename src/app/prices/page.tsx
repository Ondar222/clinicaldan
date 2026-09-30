import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PriceListPage from '@/components/PriceListPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/prices');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PriceListPage />
    </Suspense>
  );
}
