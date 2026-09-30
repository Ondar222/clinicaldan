import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import HomePage from '@/components/HomePage';

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <HomePage />
    </Suspense>
  );
}
