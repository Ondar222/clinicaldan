import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import LaboratoryDiagnosticsPage from '@/components/LaboratoryDiagnosticsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/laboratory');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <LaboratoryDiagnosticsPage />
    </Suspense>
  );
}
