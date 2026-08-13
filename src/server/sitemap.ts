/**
 * Sitemap Generator - динамическая генерация sitemap.xml
 * Собирает все URL из базы данных и направлений
 */

import express from 'express';
import { CLINIC_CONFIG } from '../data/clinicConfig';
import { DIRECTIONS } from '../services/directions';
import { COSMETOLOGY_CATEGORIES } from '../data/cosmetology';

const router = express.Router();

// Базовые страницы сайта
const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contacts', priority: '0.9', changefreq: 'monthly' },
  { url: '/doctors', priority: '0.9', changefreq: 'weekly' },
  { url: '/directions', priority: '0.9', changefreq: 'weekly' },
  { url: '/services', priority: '0.9', changefreq: 'weekly' },
  { url: '/services/cosmetology', priority: '0.9', changefreq: 'weekly' },
  { url: '/prices', priority: '0.9', changefreq: 'weekly' },
  { url: '/questions', priority: '0.7', changefreq: 'weekly' },
  { url: '/reviews', priority: '0.7', changefreq: 'weekly' },
  { url: '/checkups', priority: '0.8', changefreq: 'weekly' },
  { url: '/news', priority: '0.8', changefreq: 'daily' },
  { url: '/tools', priority: '0.7', changefreq: 'weekly' },
  { url: '/stock', priority: '0.7', changefreq: 'weekly' },
  { url: '/documents', priority: '0.6', changefreq: 'monthly' },
  { url: '/certificates', priority: '0.7', changefreq: 'weekly' },
  { url: '/medical-examinations', priority: '0.8', changefreq: 'weekly' },
  { url: '/cookie-policy', priority: '0.3', changefreq: 'yearly' },
];

// URL которые НЕ должны попадать в sitemap
const EXCLUDED_URLS = [
  '/staff',
  '/personal-cabinet',
  '/payment-',
  '/api/',
  '/vk-post/',
  '/cookie-settings',
];

function isUrlExcluded(url: string): boolean {
  return EXCLUDED_URLS.some(pattern => {
    if (pattern.endsWith('-')) {
      return url.startsWith(pattern);
    }
    return url.includes(pattern);
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface SitemapUrl {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

// GET /api/sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = CLINIC_CONFIG.siteUrl;
    const today = new Date().toISOString().split('T')[0];
    
    const urls: SitemapUrl[] = [...STATIC_PAGES];
    
    // Добавляем направления
    DIRECTIONS.forEach(direction => {
      if (!isUrlExcluded(`/directions/${direction.slug}`)) {
        urls.push({
          url: `/directions/${direction.slug}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: today
        });
      }
    });
    
    // Добавляем категории косметологии
    COSMETOLOGY_CATEGORIES.forEach(category => {
      if (!isUrlExcluded(`/services/cosmetology/${category.slug}`)) {
        urls.push({
          url: `/services/cosmetology/${category.slug}`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: today
        });
      }
    });
    
    // Попробуем получить данные из Directus если доступен
    let doctors: Array<{ id: string | number }> = [];
    let services: Array<{ slug: string }> = [];
    let news: Array<{ slug: string }> = [];
    let tools: Array<{ id: string | number }> = [];
    
    try {
      // Пробуем получить данные с локального Directus
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const token = process.env.DIRECTUS_TOKEN;
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      // Получаем врачей
      try {
        const doctorsRes = await fetch(`${directusUrl}/items/doctors?fields=id&limit=-1`, { headers });
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          doctors = doctorsData.data || [];
        }
      } catch (e) {
        console.log('[Sitemap] Could not fetch doctors:', e);
      }
      
      // Получаем услуги с slug
      try {
        const servicesRes = await fetch(`${directusUrl}/items/services?fields=slug&limit=-1`, { headers });
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          services = servicesData.data || [];
        }
      } catch (e) {
        console.log('[Sitemap] Could not fetch services:', e);
      }
      
      // Получаем новости
      try {
        const newsRes = await fetch(`${directusUrl}/items/news?fields=slug&limit=-1`, { headers });
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          news = newsData.data || [];
        }
      } catch (e) {
        console.log('[Sitemap] Could not fetch news:', e);
      }
      
      // Получаем оборудование
      try {
        const toolsRes = await fetch(`${directusUrl}/items/tools?fields=id&limit=-1`, { headers });
        if (toolsRes.ok) {
          const toolsData = await toolsRes.json();
          tools = toolsData.data || [];
        }
      } catch (e) {
        console.log('[Sitemap] Could not fetch tools:', e);
      }
      
    } catch (e) {
      console.log('[Sitemap] Directus not available, using fallback data');
    }
    
    // Добавляем врачей
    doctors.forEach(doctor => {
      const url = `/doctors/${doctor.id}`;
      if (!isUrlExcluded(url)) {
        urls.push({
          url,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: today
        });
      }
    });
    
    // Добавляем услуги
    services.forEach(service => {
      if (service.slug) {
        const url = `/services/${service.slug}`;
        if (!isUrlExcluded(url)) {
          urls.push({
            url,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: today
          });
        }
      }
    });
    
    // Добавляем новости
    news.forEach(article => {
      if (article.slug) {
        const url = `/news/${article.slug}`;
        if (!isUrlExcluded(url)) {
          urls.push({
            url,
            priority: '0.7',
            changefreq: 'weekly',
            lastmod: today
          });
        }
      }
    });
    
    // Добавляем оборудование
    tools.forEach(tool => {
      const url = `/tools/${tool.id}`;
      if (!isUrlExcluded(url)) {
        urls.push({
          url,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod: today
        });
      }
    });
    
    // Формируем XML
    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    urls.forEach(item => {
      sitemapXml += `  <url>
    <loc>${escapeXml(baseUrl + item.url)}</loc>
    <lastmod>${item.lastmod || today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`;
    });
    
    sitemapXml += '</urlset>';
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemapXml);
    
  } catch (error) {
    console.error('[Sitemap] Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;

