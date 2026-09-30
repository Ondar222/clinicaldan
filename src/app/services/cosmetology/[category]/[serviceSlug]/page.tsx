import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CosmetologyServicePage from '@/components/CosmetologyServicePage';
import { pageMeta } from '@/app/seo';

// CosmetologyServicePage читает serviceSlug через useParams (shim).
export const metadata: Metadata = pageMeta('/services/cosmetology', '/services');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CosmetologyServicePage />
    </Suspense>
  );
}
