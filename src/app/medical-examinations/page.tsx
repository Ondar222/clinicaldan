import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import MedicalExaminationsPage from '@/components/MedicalExaminationsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/medical-examinations');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <MedicalExaminationsPage />
    </Suspense>
  );
}
