import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import StaffDashboard from '@/components/StaffDashboard';
import { pageMeta } from '@/app/seo';

// Прежний SSR добавлял noindex,nofollow для путей /staff*.
export const metadata: Metadata = pageMeta('/staff');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <StaffDashboard />
    </Suspense>
  );
}
