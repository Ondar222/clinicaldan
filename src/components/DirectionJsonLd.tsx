import { CLINIC_CONFIG } from '@/data/clinicConfig';
import type { DirectionConfig } from '@/services/directions';

/**
 * Server-side JSON-LD для страницы направления:
 * MedicalWebPage + BreadcrumbList с геопривязкой к Кызылу и Республике Тыва.
 * Рендерится в статическом HTML, поэтому поисковики видят разметку
 * без исполнения JavaScript.
 */
export default function DirectionJsonLd({
  direction,
}: {
  direction: DirectionConfig;
}) {
  const url = `${CLINIC_CONFIG.siteUrl}/services/${direction.slug}`;
  const name =
    direction.seoTitle || `${direction.title} в Кызыле — Клиника Алдан`;
  const description =
    direction.seoDescription ||
    `${direction.title} в Кызыле — Клиника Алдан (${CLINIC_CONFIG.address.region}).`;

  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name,
      description,
      url,
      inLanguage: 'ru-RU',
      about: {
        '@type': 'MedicalTherapy',
        name: direction.title,
      },
      geographicArea: {
        '@type': 'City',
        name: CLINIC_CONFIG.address.city,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: CLINIC_CONFIG.address.region,
        },
      },
      provider: {
        '@type': 'MedicalClinic',
        name: CLINIC_CONFIG.siteName,
        url: CLINIC_CONFIG.siteUrl,
        telephone: CLINIC_CONFIG.phoneClean,
        address: {
          '@type': 'PostalAddress',
          streetAddress: CLINIC_CONFIG.address.street,
          addressLocality: CLINIC_CONFIG.address.city,
          addressRegion: CLINIC_CONFIG.address.region,
          postalCode: CLINIC_CONFIG.address.postalCode,
          addressCountry: CLINIC_CONFIG.address.country,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Главная',
          item: CLINIC_CONFIG.siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Направления',
          item: `${CLINIC_CONFIG.siteUrl}/directions`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: direction.title,
          item: url,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
