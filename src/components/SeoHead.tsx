/**
 * SEO Head Component - управляет мета-тегами для каждой страницы
 * Использует React для обновления тегов, дополняется серверным рендерингом
 */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CLINIC_CONFIG, getTelLink, getMailLink } from '../data/clinicConfig';

export interface SeoPageData {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

interface SeoHeadProps {
  pageData: SeoPageData;
}

/**
 * Компонент для динамического управления SEO-метатегами
 * Вставляется в каждую страницу для управления title, description, og и др.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({ pageData }) => {
  const location = useLocation();
  
  // Формируем полный канонический URL
  const canonicalUrl = pageData.canonical 
    ? `${CLINIC_CONFIG.siteUrl}${pageData.canonical}`
    : `${CLINIC_CONFIG.siteUrl}${location.pathname}`;
  
  // Используем pageData или значения по умолчанию
  const title = pageData.title || CLINIC_CONFIG.defaultTitle;
  const description = pageData.description || CLINIC_CONFIG.defaultDescription;
  const ogTitle = pageData.ogTitle || title;
  const ogDescription = pageData.ogDescription || description;
  const ogImage = pageData.ogImage || CLINIC_CONFIG.defaultImage;
  const ogUrl = pageData.ogUrl || canonicalUrl;
  const ogType = pageData.ogType || 'website';
  const twitterTitle = pageData.twitterTitle || ogTitle;
  const twitterDescription = pageData.twitterDescription || ogDescription;
  const twitterImage = pageData.twitterImage || ogImage;
  
  // Обновляем title
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  // Обновляем meta теги
  useEffect(() => {
    // Description
    updateMetaTag('name', 'description', description);
    
    // Robots
    const robots: string[] = [];
    if (pageData.noindex) robots.push('noindex');
    if (pageData.nofollow) robots.push('nofollow');
    updateMetaTag('name', 'robots', robots.length > 0 ? robots.join(', ') : 'index,follow');
    
    // Open Graph
    updateMetaTag('property', 'og:title', ogTitle);
    updateMetaTag('property', 'og:description', ogDescription);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:url', ogUrl);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', CLINIC_CONFIG.siteName);
    updateMetaTag('property', 'og:locale', 'ru_RU');
    
    // Twitter
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', twitterTitle);
    updateMetaTag('name', 'twitter:description', twitterDescription);
    updateMetaTag('name', 'twitter:image', twitterImage);
    updateMetaTag('name', 'twitter:domain', CLINIC_CONFIG.siteUrl);
    
    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    return () => {
      // Очистка при размонтировании (опционально)
    };
  }, [
    title, description, ogTitle, ogDescription, ogImage, ogUrl, ogType,
    twitterTitle, twitterDescription, twitterImage, canonicalUrl, pageData.noindex, pageData.nofollow
  ]);
  
  return null;
};

/**
 * Вспомогательная функция для обновления meta тега
 */
function updateMetaTag(
  type: 'name' | 'property',
  name: string,
  content: string
): void {
  let element: HTMLMetaElement | null;
  
  if (type === 'property') {
    element = document.querySelector(`meta[property="${name}"]`);
  } else {
    element = document.querySelector(`meta[name="${name}"]`);
  }
  
  if (!element) {
    element = document.createElement('meta');
    if (type === 'property') {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

/**
 * Хук для использования SEO данных в компонентах
 */
export function useSeo(pageData: SeoPageData) {
  return <SeoHead pageData={pageData} />;
}

/**
 * Функция генерации SEO данных для страницы услуги
 */
export function generateServiceSeo(service: {
  name: string;
  description: string;
  slug: string;
  price?: number;
}): SeoPageData {
  return {
    title: `${service.name} в Кызыле — Клиника Алдан`,
    description: `${service.description.substring(0, 150)} ${service.price ? `Цена от ${service.price} руб.` : ''} Запись на прием по телефону ${CLINIC_CONFIG.phoneFormatted}.`,
    canonical: `/services/${service.slug}`,
    ogType: 'website'
  };
}

/**
 * Функция генерации SEO данных для страницы врача
 */
export function generateDoctorSeo(doctor: {
  name: string;
  specialty: string;
  id: string | number;
}): SeoPageData {
  return {
    title: `${doctor.name} — ${doctor.specialty} в Кызыле | Клиника Алдан`,
    description: `${doctor.name}, ${doctor.specialty}. Запись на прием в Клинике Алдан по телефону ${CLINIC_CONFIG.phoneFormatted}. Высококвалифицированный специалист с многолетним опытом работы.`,
    canonical: `/doctors/${doctor.id}`,
    ogType: 'profile'
  };
}

/**
 * Функция генерации SEO данных для статьи/новости
 */
export function generateArticleSeo(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt?: string;
}): SeoPageData {
  return {
    title: `${article.title} — Клиника Алдан`,
    description: article.description,
    canonical: `/news/${article.slug}`,
    ogType: 'article'
  };
}

export default SeoHead;
