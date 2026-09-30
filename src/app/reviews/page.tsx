import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ReviewsPage from '@/components/ReviewsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/reviews');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ReviewsPage />
    </Suspense>
  );
}
