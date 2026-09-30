import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ContactsPage from '@/components/ContactsPage';
import { pageMeta } from '@/app/seo';

export const metadata: Metadata = pageMeta('/contacts');

export default function Page() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ContactsPage />
    </Suspense>
  );
}
