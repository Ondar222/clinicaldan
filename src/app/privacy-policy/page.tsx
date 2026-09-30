import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import PrivacyPolicyPage from '@/components/PrivacyPolicyPage';
import { pageMeta } from '@/app/seo';

// Для /privacy-policy в прежнем SSR не было записи — используется дефолт + self-canonical.
export const metadata: Metadata = pageMeta('/privacy-policy');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <PrivacyPolicyPage />
    </Suspense>
  );
}
