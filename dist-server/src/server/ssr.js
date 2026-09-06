/**
 * SSR Server - серверный рендеринг для SEO
 * Использует React для рендеринга страниц на сервере
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { CLINIC_CONFIG } from '../data/clinicConfig.js';
import { DIRECTIONS } from '../services/directions.js';
// Import your App component - это нужно для SSR
// В реальном приложении нужно экспортировать App отдельно
// SEO мета-данные для разных страниц
const SEO_PAGES = {
    '/': {
        title: CLINIC_CONFIG.defaultTitle,
        description: CLINIC_CONFIG.defaultDescription,
        ogType: 'website'
    },
    '/about': {
        title: 'О клинике Алдан — многопрофильный медицинский центр в Кызыле',
        description: 'Клиника Алдан с 2013 года оказывает медицинскую помощь в Кызыле. Более 25 направлений, современное оборудование, высококвалифицированные специалисты. Запись на прием по телефону.',
        ogType: 'website',
        canonical: '/about'
    },
    '/contacts': {
        title: 'Контакты и адрес клиники Алдан в Кызыле',
        description: `Клиника Алдан: адрес ${CLINIC_CONFIG.address.street}, ${CLINIC_CONFIG.address.city}. Телефон: ${CLINIC_CONFIG.phoneFormatted}. Режим работы: Пн-Пт ${CLINIC_CONFIG.workingHours.weekdays}, Сб ${CLINIC_CONFIG.workingHours.saturday}.`,
        ogType: 'website',
        canonical: '/contacts'
    },
    '/doctors': {
        title: 'Врачи клиники Алдан — высококвалифицированные специалисты в Кызыле',
        description: 'Наши врачи — высококвалифицированные специалисты с многолетним опытом работы. Запись на прием к терапевту, кардиологу, неврологу, хирургу и другим специалистам.',
        ogType: 'website',
        canonical: '/doctors'
    },
    '/directions': {
        title: 'Медицинские направления клиники Алдан в Кызыле',
        description: 'Более 25 медицинских направлений: сосудистая хирургия, флебология, гинекология, косметология, УЗИ, анализы и диагностика. Современное оборудование и опытные специалисты.',
        ogType: 'website',
        canonical: '/directions'
    },
    '/prices': {
        title: 'Прайс-лист на медицинские услуги клиники Алдан',
        description: 'Актуальные цены на все медицинские услуги клиники Алдан. Лабораторные исследования, УЗИ, консультации специалистов, диагностика и лечение. Прозрачное ценообразование.',
        ogType: 'website',
        canonical: '/prices'
    },
    '/questions': {
        title: 'Часто задаваемые вопросы — Клиника Алдан',
        description: 'Ответы на частые вопросы о записи на прием, подготовке к исследованиям, режиме работы клиники и других аспектах оказания медицинской помощи в Клинике Алдан.',
        ogType: 'website',
        canonical: '/questions'
    },
    '/reviews': {
        title: 'Отзывы пациентов — Клиника Алдан',
        description: 'Отзывы пациентов о клинике Алдан. Реальные отзывы о качестве медицинских услуг, работе врачей и обслуживании в нашей клинике в Кызыле.',
        ogType: 'website',
        canonical: '/reviews'
    },
    '/checkups': {
        title: 'Чекап в Кызыле — чекап организма в Клинике Алдан',
        description: 'Чекап организма в Клинике Алдан (Кызыл): комплексное обследование, анализы, УЗИ, ЭКГ за один визит. Профилактические медосмотры и диспансеризация. Запись: +7 923 317-60-60.',
        ogType: 'website',
        canonical: '/checkups'
    },
    '/news': {
        title: 'Новости и статьи — Клиника Алдан',
        description: 'Новости медицины, статьи о здоровье, информация о новых услугах и акциях клиники Алдан. Полезная информация для пациентов.',
        ogType: 'website',
        canonical: '/news'
    },
    '/tools': {
        title: 'Оборудование клиники Алдан — современная диагностика',
        description: 'Современное медицинское оборудование клиники Алдан в Кызыле. Диагностические аппараты экспертного класса для точной диагностики и эффективного лечения.',
        ogType: 'website',
        canonical: '/tools'
    },
    '/stock': {
        title: 'Акции и специальные предложения — Клиника Алдан',
        description: 'Акции и скидки на медицинские услуги в клинике Алдан. Выгодные предложения на диагностику, консультации специалистов и лечение.',
        ogType: 'website',
        canonical: '/stock'
    },
    '/medical-examinations': {
        title: 'Медицинские осмотры — Клиника Алдан',
        description: 'Все виды медицинских осмотров: предварительные, периодические, профилактические. Оформление справок и медицинских книжек в Кызыле.',
        ogType: 'website',
        canonical: '/medical-examinations'
    },
    '/services': {
        title: 'Медицинские услуги клиники Алдан в Кызыле',
        description: 'Полный спектр медицинских услуг: лабораторные исследования, УЗИ, консультации специалистов, диагностика и лечение. Запись на прием по телефону.',
        ogType: 'website',
        canonical: '/services'
    },
    '/documents': {
        title: 'Документы и лицензии — Клиника Алдан',
        description: 'Лицензии и разрешительные документы клиники Алдан. Информация о юридических документах и сертификатах медицинского центра.',
        ogType: 'website',
        canonical: '/documents'
    },
    '/certificates': {
        title: 'Подарочные сертификаты — Клиника Алдан',
        description: 'Подарочные сертификаты на медицинские услуги в клинике Алдан. Отличный подарок для близких — здоровье и забота о себе.',
        ogType: 'website',
        canonical: '/certificates'
    },
    '/cookie-policy': {
        title: 'Политика обработки cookies — Клиника Алдан',
        description: 'Политика использования файлов cookies на сайте клиники Алдан. Информация о том, как мы используем cookies и аналогичные технологии.',
        ogType: 'website',
        canonical: '/cookie-policy'
    }
};
// Добавляем SEO данные для направлений
DIRECTIONS.forEach(direction => {
    const url = `/directions/${direction.slug}`;
    SEO_PAGES[url] = {
        title: direction.seoTitle || `${direction.title} в Кызыле — Клиника Алдан`,
        description: direction.seoDescription || `${direction.description.substring(0, 150)} Запись на прием по телефону ${CLINIC_CONFIG.phoneFormatted}.`,
        ogType: 'website',
        canonical: url
    };
});
/**
 * Генерирует HTML с SEO-метатегами для конкретной страницы
 */
export function generateSeoHtml(pathname, template) {
    const baseUrl = CLINIC_CONFIG.siteUrl;
    const canonicalUrl = `${baseUrl}${pathname}`;
    // Находим SEO данные для страницы
    let seoData = SEO_PAGES[pathname];
    // Если exact match не найден, пробуем найти по части пути
    if (!seoData) {
        for (const [key, value] of Object.entries(SEO_PAGES)) {
            if (pathname.startsWith(key)) {
                seoData = value;
                break;
            }
        }
    }
    // Используем дефолтные значения если не найдено
    const title = seoData?.title || CLINIC_CONFIG.defaultTitle;
    const description = seoData?.description || CLINIC_CONFIG.defaultDescription;
    const ogType = seoData?.ogType || 'website';
    const canonical = seoData?.canonical || pathname;
    // Генерируем метатеги
    const seoTags = `
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="${CLINIC_CONFIG.siteName}" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:image" content="${CLINIC_CONFIG.defaultImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  `;
    // Заменяем плейсхолдер в шаблоне
    return template.replace('<!-- SEO_PLACEHOLDER -->', seoTags);
}
/**
 * SSR Router - обрабатывает запросы и возвращает HTML с SEO
 */
export function createSsrRouter() {
    const router = express.Router();
    router.use(async (req, res, next) => {
        // Пропускаем API запросы
        if (req.path.startsWith('/api/') || req.path.startsWith('/src/')) {
            return next();
        }
        // Пропускаем статические файлы
        const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
        const ext = path.extname(req.path);
        if (staticExtensions.includes(ext)) {
            return next();
        }
        try {
            const templatePath = path.join(process.cwd(), 'dist', 'index.html');
            // Проверяем, есть ли скомпилированный HTML
            if (!fs.existsSync(templatePath)) {
                return next();
            }
            let template = fs.readFileSync(templatePath, 'utf-8');
            // Добавляем SEO теги
            template = generateSeoHtml(req.path, template);
            // Добавляем noindex для неосновных страниц
            if (req.path.startsWith('/staff') || req.path.startsWith('/payment')) {
                template = template.replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>');
            }
            // Возвращаем HTML с SEO
            res.set('Content-Type', 'text/html');
            res.send(template);
        }
        catch (error) {
            console.error('[SSR] Error:', error);
            next();
        }
    });
    return router;
}
export default createSsrRouter;
