/**
 * Clinic Configuration - единый источник данных для контактов и организации
 * Используется во всех компонентах: хедер, футер, контакты, schema, FAQ
 */

export interface ClinicContact {
  phone: string;
  phoneFormatted: string;
  phoneClean: string;
  email: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    full: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    array: string[];
  };
  social: {
    vk: string;
    telegram?: string;
  };
}

export interface SeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle: string;
}

/**
 * Единая конфигурация клиники
 * Изменения в этом файле автоматически отразятся во всех компонентах
 */
export const CLINIC_CONFIG: ClinicContact & SeoConfig = {
  // Контакты
  phone: '+7 (923) 317-60-60',
  phoneFormatted: '+7 (923) 317-60-60',
  phoneClean: '+79233176060',
  email: 'clinicaldan@mail.ru',
  
  address: {
    street: 'ул. Ленина, 60, офис 1',
    city: 'Кызыл',
    region: 'Республика Тыва',
    postalCode: '667000',
    country: 'RU',
    full: 'ул. Ленина, 60, офис 1, Кызыл, Республика Тыва, 667000'
  },
  
  coordinates: {
    lat: 51.7191,
    lng: 94.4268
  },
  
  workingHours: {
    weekdays: '08:00-22:00',
    saturday: '09:00-18:00',
    sunday: 'Выходной',
    array: [
      'Monday-Friday: 08:00-22:00',
      'Saturday: 09:00-18:00',
      'Sunday: Closed'
    ]
  },
  
  social: {
    vk: 'https://vk.com/clinicaldan'
  },
  
  // SEO конфигурация
  siteName: 'Клиника Алдан',
  siteUrl: 'https://clinicaldan.ru',
  defaultTitle: 'Клиника Алдан — многопрофильный медицинский центр в Кызыле',
  defaultDescription: 'Клиника Алдан в Кызыле с 2013 года. Более 25 медицинских направлений: сосудистая хирургия, флебология, косметология, анализы, УЗИ, чекап. Высококвалифицированные специалисты. Запись на прием по телефону.',
  defaultImage: 'https://clinicaldan.ru/og-image.jpg',
  twitterHandle: '@clinicaldan'
};

/**
 * Хелпер для генерации tel: ссылки
 */
export function getTelLink(phone?: string): string {
  const phoneToUse = phone || CLINIC_CONFIG.phoneClean;
  return `tel:${phoneToUse}`;
}

/**
 * Хелпер для генерации mailto: ссылки
 */
export function getMailLink(email?: string): string {
  const emailToUse = email || CLINIC_CONFIG.email;
  return `mailto:${emailToUse}`;
}

/**
 * Хелпер для получения адреса для schema.org
 */
export function getAddressForSchema() {
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: CLINIC_CONFIG.address.street,
    addressLocality: CLINIC_CONFIG.address.city,
    addressRegion: CLINIC_CONFIG.address.region,
    postalCode: CLINIC_CONFIG.address.postalCode,
    addressCountry: CLINIC_CONFIG.address.country
  };
}

/**
 * Хелпер для получения geo coordinates для schema.org
 */
export function getGeoForSchema() {
  return {
    '@type': 'GeoCoordinates' as const,
    latitude: CLINIC_CONFIG.coordinates.lat.toString(),
    longitude: CLINIC_CONFIG.coordinates.lng.toString()
  };
}

/**
 * Хелпер для получения часов работы для schema.org
 */
export function getOpeningHoursForSchema() {
  return CLINIC_CONFIG.workingHours.array.map(hours => {
    const [days, time] = hours.split(': ');
    return {
      '@type': 'OpeningHoursSpecification' as const,
      dayOfWeek: days.replace('-', '-'),
      opens: time.split('-')[0],
      closes: time.split('-')[1]
    };
  });
}

export default CLINIC_CONFIG;
