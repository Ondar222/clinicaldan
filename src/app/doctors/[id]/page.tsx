import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import DoctorDetailsPage from '@/components/DoctorDetailsPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR: для /doctors/:id мета-данные раздела /doctors (prefix-match).
export const metadata: Metadata = pageMeta('/doctors');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DoctorDetailsPage />
    </Suspense>
  );
}
