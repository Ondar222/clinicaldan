import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import DocumentsPage from '@/components/DocumentsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/documents');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <DocumentsPage />
    </Suspense>
  );
}
