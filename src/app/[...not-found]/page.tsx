import type { Metadata } from 'next';
import NotFoundPage from '@/components/NotFoundPage';
import { pageMeta } from '@/app/seo';

// Catch-all для несуществующих путей — как <Route path="*"> в прежнем App.tsx.
export const metadata: Metadata = {
  ...pageMeta('/'),
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NotFoundPage />;
}
