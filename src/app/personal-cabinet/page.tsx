import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import AdminCabinetPage from '@/components/AdminCabinetPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/personal-cabinet');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminCabinetPage />
    </Suspense>
  );
}
