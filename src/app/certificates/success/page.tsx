import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PaymentSuccessPage from '@/components/PaymentSuccessPage';
import { pageMeta } from '@/app/seo';

// Прежний SSR выдавал для /certificates/success мета-данные раздела /certificates
// (prefix-match) с canonical '/certificates'.
export const metadata: Metadata = pageMeta('/certificates');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PaymentSuccessPage type="certificate" />
    </Suspense>
  );
}
