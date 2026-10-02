import PageFallback from '@/components/PageFallback';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ServicePage from '@/components/ServicePage';
import DirectionJsonLd from '@/components/DirectionJsonLd';
import { pageMeta } from '@/app/seo';
import { DIRECTIONS, getDirectionBySlug } from '@/services/directions';
import { CLINIC_CONFIG } from '@/data/clinicConfig';

/**
 * SEO направлений: каждое направление статически рендерится со своими
 * мета-тегами (title/description/keywords/canonical), чтобы поисковики
 * находили страницу по запросам «<Направление> Кызыл», «<Направление> Алдан»,
 * «<Направление> Тыва» без исполнения JavaScript.
 */
export function generateStaticParams() {
  const seen = new Set<string>();
  return DIRECTIONS.filter((d) => {
    if (seen.has(d.slug)) return false;
    seen.add(d.slug);
    return true;
  }).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const direction = getDirectionBySlug(slug);

  // Неизвестный slug — метаданные раздела /services (как в прежнем SSR).
  if (!direction) return pageMeta('/services', '/services');

  const path = `/services/${slug}`;
  const title =
    direction.seoTitle ||
    `${direction.title} в Кызыле — Клиника Алдан (Тыва)`;
  const description =
    direction.seoDescription ||
    `${direction.title} в Кызыле — приём и диагностика в Клинике Алдан (${CLINIC_CONFIG.address.region}). Запись: ${CLINIC_CONFIG.phoneFormatted}.`;

  // Гео-варианты ключей: «Урология Кызыл», «Урология Алдан», «Урология Тыва».
  const geoKeywords = [
    `${direction.title} Кызыл`,
    `${direction.title} Кызыл цена`,
    `${direction.title} Алдан`,
    `${direction.title} клиника Алдан`,
    `${direction.title} Тыва`,
    `${direction.title} Тува`,
  ].join(', ');
  const keywords = direction.seoKeywords
    ? `${direction.seoKeywords}, ${geoKeywords}`
    : geoKeywords;

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      locale: 'ru_RU',
      siteName: CLINIC_CONFIG.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const direction = getDirectionBySlug(slug);

  return (
    <>
      {direction ? <DirectionJsonLd direction={direction} /> : null}
      <Suspense fallback={<PageFallback />}>
        <ServicePage />
      </Suspense>
    </>
  );
}
