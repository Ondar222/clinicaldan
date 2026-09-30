import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import AboutClinicPage from '@/components/AboutClinicPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/about');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AboutClinicPage />
    </Suspense>
  );
}
