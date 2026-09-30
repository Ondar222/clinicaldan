import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PaymentFailedPage from '@/components/PaymentFailedPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR добавлял noindex,nofollow для путей /payment*.
export const metadata: Metadata = pageMeta('/payment-failed');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PaymentFailedPage />
    </Suspense>
  );
}
