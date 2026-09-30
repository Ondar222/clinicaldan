import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import DoctorsPage from '@/components/DoctorsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/doctors');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DoctorsPage />
    </Suspense>
  );
}
