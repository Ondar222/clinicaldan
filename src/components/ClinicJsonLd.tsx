import { CLINIC_CONFIG } from '@/data/clinicConfig';

/**
 * Разметка Schema.org MedicalClinic — перенесена из <head> в index.html.
 * Значения берутся из CLINIC_CONFIG, чтобы не держать два источника правды.
 */
export default function ClinicJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: CLINIC_CONFIG.siteName,
    url: CLINIC_CONFIG.siteUrl,
    logo: '/favicon.png',
    description: CLINIC_CONFIG.defaultDescription,
    telephone: ['+79233176060', '+79233816060'],
    email: CLINIC_CONFIG.email,
    foundingDate: '2013',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC_CONFIG.address.street,
      addressLocality: CLINIC_CONFIG.address.city,
      addressRegion: CLINIC_CONFIG.address.region,
      postalCode: CLINIC_CONFIG.address.postalCode,
      addressCountry: CLINIC_CONFIG.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: String(CLINIC_CONFIG.coordinates.lat),
      longitude: String(CLINIC_CONFIG.coordinates.lng),
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    medicalSpecialty: [
      'Gynecology',
      'Urology',
      'Surgery',
      'Cardiology',
      'Pediatric',
      'Neurology',
      'Optometry',
      'Endocrinology',
      'Gastroenterology',
      'Hematology',
      'Pulmonology',
      'Rheumatology',
      'Otolaryngology',
      'Nephrology',
      'Oncology',
      'GeneralPractice',
      'LaboratoryScience',
      'Radiology',
      'PlasticSurgery',
      'Dermatology',
    ],
    additionalType: [
      'https://schema.org/MedicalClinic',
      'Травматология и ортопедия',
      'Сосудистая хирургия и флебология',
      'Проктология',
      'Функциональная диагностика',
      'Медосмотры',
      'Эндоскопия',
    ],
    isAcceptingNewPatients: true,
    priceRange: '₽₽',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
