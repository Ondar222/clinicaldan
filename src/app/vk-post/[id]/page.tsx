import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import VkPostDetailPage from '@/components/VkPostDetailPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <VkPostDetailPage />
    </Suspense>
  );
}
