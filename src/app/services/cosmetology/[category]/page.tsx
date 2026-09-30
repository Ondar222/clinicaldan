import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import CosmetologyPage from '@/components/CosmetologyPage';
import { pageMeta } from '@/app/seo';

// CosmetologyPage сам читает сегмент [category] через useParams (shim),
// поэтому проп categorySlug здесь не передаётся — как в прежнем App.tsx.
export const metadata: Metadata = pageMeta('/services/cosmetology', '/services');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CosmetologyPage />
    </Suspense>
  );
}
