/**
 * Schema.org JSON-LD structured data for SEO
 * Helps search engines understand the clinic's services, doctors, and organization
 */

export interface ClinicInfo {
  name: string;
  url: string;
  logo: string;
  phone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
}

export interface ServiceData {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  provider?: ClinicInfo;
}

export interface DoctorData {
  name: string;
  specialty: string;
  image?: string;
  description?: string;
  provider?: ClinicInfo;
}

/**
 * Generate Organization schema for the clinic
 */
export function generateOrganizationSchema(clinic: ClinicInfo): object {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": clinic.name,
    "url": clinic.url,
    "logo": clinic.logo,
    "telephone": clinic.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinic.address.streetAddress,
      "addressLocality": clinic.address.addressLocality,
      "postalCode": clinic.address.postalCode,
      "addressCountry": clinic.address.addressCountry
    },
    ...(clinic.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": clinic.geo.latitude,
        "longitude": clinic.geo.longitude
      }
    }),
    ...(clinic.openingHours && {
      "openingHoursSpecification": clinic.openingHours.map(hours => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": hours
      }))
    }),
    "priceRange": clinic.priceRange || "$$",
    "@id": clinic.url
  };
}

/**
 * Generate MedicalWebPage schema for a page
 */
export function generateMedicalWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  lastModified?: string;
  publisher?: ClinicInfo;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": options.name,
    "description": options.description,
    "url": options.url,
    ...(options.lastModified && {
      "lastModified": options.lastModified
    }),
    ...(options.publisher && {
      "publisher": {
        "@type": "MedicalOrganization",
        "name": options.publisher.name,
        "url": options.publisher.url
      }
    })
  };
}

/**
 * Generate MedicalService schema for a service
 */
export function generateMedicalServiceSchema(service: ServiceData): object {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalService",
    "name": service.name,
    ...(service.description && {
      "description": service.description
    }),
    ...(service.price && {
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": service.name,
        "itemListElement": [{
          "@type": "Offer",
          "price": service.price.toString(),
          "priceCurrency": service.currency || "RUB",
          "availability": "https://schema.org/InStock"
        }]
      }
    }),
    ...(service.provider && {
      "provider": {
        "@type": "MedicalOrganization",
        "name": service.provider.name,
        "url": service.provider.url
      }
    })
  };
}

/**
 * Generate Physician schema for a doctor
 */
export function generatePhysicianSchema(doctor: DoctorData): object {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": doctor.name,
    "medicalSpecialty": doctor.specialty,
    ...(doctor.image && {
      "image": doctor.image
    }),
    ...(doctor.description && {
      "description": doctor.description
    }),
    ...(doctor.provider && {
      "affiliation": {
        "@type": "MedicalOrganization",
        "name": doctor.provider.name,
        "url": doctor.provider.url
      }
    })
  };
}

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Generate FAQPage schema for FAQ pages
 */
export function generateFAQSchema(questions: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}

/**
 * Generate LocalBusiness schema with service areas
 */
export function generateLocalBusinessSchema(clinic: ClinicInfo & { serviceAreas?: string[] }): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": clinic.name,
    "url": clinic.url,
    "logo": clinic.logo,
    "telephone": clinic.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": clinic.address.streetAddress,
      "addressLocality": clinic.address.addressLocality,
      "postalCode": clinic.address.postalCode,
      "addressCountry": clinic.address.addressCountry
    },
    ...(clinic.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": clinic.geo.latitude,
        "longitude": clinic.geo.longitude
      }
    }),
    "openingHoursSpecification": clinic.openingHours?.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hours
    })) || [],
    "priceRange": clinic.priceRange || "$$",
    ...(clinic.serviceAreas && {
      "areaServed": clinic.serviceAreas.map(area => ({
        "@type": "City",
        "name": area
      }))
    })
  };
}

/**
 * Generate aggregate rating schema for reviews
 */
export function generateAggregateRatingSchema(rating: {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": rating.ratingValue.toString(),
    "reviewCount": rating.reviewCount.toString(),
    "bestRating": (rating.bestRating || 5).toString(),
    "worstRating": (rating.worstRating || 1).toString()
  };
}

/**
 * Combine multiple schemas into one script
 */
export function combineSchemas(...schemas: object[]): object[] {
  return schemas;
}

/**
 * Generate complete JSON-LD script for a page
 */
export function generatePageSchema(options: {
  clinic: ClinicInfo;
  pageName: string;
  pageDescription: string;
  pageUrl: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  services?: ServiceData[];
  doctors?: DoctorData[];
  faqs?: Array<{ question: string; answer: string }>;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}): string {
  const schemas: object[] = [];

  // Organization schema (always included)
  schemas.push(generateOrganizationSchema(options.clinic));

  // MedicalWebPage schema
  schemas.push(generateMedicalWebPageSchema({
    name: options.pageName,
    description: options.pageDescription,
    url: options.pageUrl,
    publisher: options.clinic
  }));

  // LocalBusiness schema
  schemas.push(generateLocalBusinessSchema(options.clinic));

  // Breadcrumb schema
  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(options.breadcrumbs));
  }

  // Service schemas (limit to first 10 for performance)
  if (options.services && options.services.length > 0) {
    options.services.slice(0, 10).forEach(service => {
      schemas.push(generateMedicalServiceSchema(service));
    });
  }

  // Doctor schemas (limit to first 10 for performance)
  if (options.doctors && options.doctors.length > 0) {
    options.doctors.slice(0, 10).forEach(doctor => {
      schemas.push(generatePhysicianSchema(doctor));
    });
  }

  // FAQ schema
  if (options.faqs && options.faqs.length > 0) {
    schemas.push(generateFAQSchema(options.faqs));
  }

  // Aggregate rating schema
  if (options.aggregateRating) {
    schemas.push(generateAggregateRatingSchema(options.aggregateRating));
  }

  return JSON.stringify({ "@graph": schemas });
}
