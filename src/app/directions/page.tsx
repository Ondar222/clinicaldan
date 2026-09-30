import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import DirectionsPage from '@/components/DirectionsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/directions');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DirectionsPage />
    </Suspense>
  );
}
