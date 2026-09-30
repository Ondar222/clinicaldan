import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PaymentCancelPage from '@/components/PaymentCancelPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR: мета-данные раздела /certificates (prefix-match), canonical '/certificates'.
export const metadata: Metadata = pageMeta('/certificates');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PaymentCancelPage />
    </Suspense>
  );
}
