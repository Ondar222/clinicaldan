import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PromotionsPage from '@/components/PromotionsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/stock');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PromotionsPage />
    </Suspense>
  );
}
