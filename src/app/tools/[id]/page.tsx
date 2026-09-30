import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ToolDetailsPage from '@/components/ToolDetailsPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR: для /tools/:id мета-данные раздела /tools (prefix-match).
export const metadata: Metadata = pageMeta('/tools');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ToolDetailsPage />
    </Suspense>
  );
}
