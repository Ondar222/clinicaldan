import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import FAQPage from '@/components/FAQPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/questions');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <FAQPage />
    </Suspense>
  );
}
