import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import NewsPage from '@/components/NewsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/news');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <NewsPage />
    </Suspense>
  );
}
