import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CheckupsPage from '@/components/CheckupsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/checkups');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CheckupsPage />
    </Suspense>
  );
}
