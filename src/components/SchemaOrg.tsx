import React from 'react';
import { generatePageSchema, type ClinicInfo, type ServiceData, type DoctorData } from '../utils/schemaOrg';

interface SchemaOrgProps {
  pageName: string;
  pageDescription: string;
  pageUrl: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  services?: ServiceData[];
  doctors?: DoctorData[];
  faqs?: Array<{ question: string; answer: string }>;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}

// Clinic configuration
const CLINIC_INFO: ClinicInfo = {
  name: 'Клиника Алдан',
  url: 'https://clinicaldan.ru',
  logo: 'https://clinicaldan.ru/Logo.png',
  phone: '+7 (394-22) 3-03-03',
  address: {
    streetAddress: 'ул. Ленина, 60',
    addressLocality: 'Кызыл',
    postalCode: '667000',
    addressCountry: 'RU'
  },
  geo: {
    latitude: 51.715,
    longitude: 94.455
  },
  openingHours: [
    'Monday-Friday: 08:00-20:00',
    'Saturday: 09:00-17:00',
    'Sunday: Closed'
  ],
  priceRange: '$$'
};

/**
 * SchemaOrg component - injects JSON-LD structured data for SEO
 * 
 * Usage:
 * <SchemaOrg 
 *   pageName="Прайс-лист"
 *   pageDescription="Актуальные цены на все услуги клиники"
 *   pageUrl="https://clinicaldan.ru/prices"
 *   services={topServices}
 * />
 */
export const SchemaOrg: React.FC<SchemaOrgProps> = ({
  pageName,
  pageDescription,
  pageUrl,
  breadcrumbs,
  services,
  doctors,
  faqs,
  aggregateRating
}) => {
  const schemaJson = generatePageSchema({
    clinic: CLINIC_INFO,
    pageName,
    pageDescription,
    pageUrl,
    breadcrumbs,
    services,
    doctors,
    faqs,
    aggregateRating
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaJson }}
    />
  );
};

export default SchemaOrg;
