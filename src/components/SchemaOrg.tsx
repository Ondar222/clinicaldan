import type React from 'react';
import { generatePageSchema, type ClinicInfo, type ServiceData, type DoctorData } from '../utils/schemaOrg';
import { CLINIC_CONFIG, getAddressForSchema, getGeoForSchema } from '../data/clinicConfig';

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

// Clinic configuration - используем единый конфиг
const CLINIC_INFO: ClinicInfo = {
  name: CLINIC_CONFIG.siteName,
  url: CLINIC_CONFIG.siteUrl,
  logo: CLINIC_CONFIG.defaultImage,
  phone: CLINIC_CONFIG.phoneClean,
  address: {
    streetAddress: CLINIC_CONFIG.address.street,
    addressLocality: CLINIC_CONFIG.address.city,
    postalCode: CLINIC_CONFIG.address.postalCode,
    addressCountry: CLINIC_CONFIG.address.country
  },
  geo: {
    latitude: CLINIC_CONFIG.coordinates.lat,
    longitude: CLINIC_CONFIG.coordinates.lng
  },
  openingHours: CLINIC_CONFIG.workingHours.array,
  priceRange: '₽₽'
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
