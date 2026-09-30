import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ToolsPage from '@/components/ToolsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/tools');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ToolsPage />
    </Suspense>
  );
}
