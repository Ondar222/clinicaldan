import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import GiftCertificatesPage from '@/components/GiftCertificatesPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/certificates');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <GiftCertificatesPage />
    </Suspense>
  );
}
