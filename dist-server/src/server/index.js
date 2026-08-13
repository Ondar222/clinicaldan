/**
 * Main Server Entry Point
 * Объединяет API endpoints и SSR для продакшена
 */
import express from 'express';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import sitemapRouter from './sitemap.js';
import certificateAdminRouter from './certificateAdmin.js';
import { createSsrRouter } from './ssr.js';
import appointmentRouter from '../../server-appointment.js';
import contactRouter from '../../server-contact.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.json());
// CORS для API - ДО всех маршрутов
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// Archimed API proxy
const archimedApiUrl = process.env.ARCHIMED_API_URL || 'https://newapi.archimed-soft.ru/api/v5';
const archimedApiToken = process.env.ARCHIMED_API_TOKEN || '';
app.use('/api/archimed', createProxyMiddleware({
    target: archimedApiUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/api/archimed': '' },
    on: {
        proxyReq: (proxyReq) => {
            if (archimedApiToken) {
                proxyReq.setHeader('Authorization', `Bearer ${archimedApiToken}`);
            }
            proxyReq.setHeader('Accept', 'application/json');
        },
    },
}));
// VK API proxy - проксирует запросы к VK API для новостей
const vkApiToken = process.env.VK_API_TOKEN || '';
const vkOwnerId = process.env.VK_OWNER_ID || '';
app.use('/api/vk', (req, res, next) => {
    // Превращаем /api/vk/posts?count=10&offset=0 в вызов VK API
    const url = new URL(req.url, `http://${req.headers.host}`);
    const count = url.searchParams.get('count') || '20';
    const offset = url.searchParams.get('offset') || '0';
    const vkUrl = `https://api.vk.com/method/wall.get?owner_id=${vkOwnerId}&count=${count}&offset=${offset}&extended=1&access_token=${vkApiToken}&v=5.131`;
    fetch(vkUrl)
        .then(response => response.json())
        .then(vkData => {
        // VK API возвращает { response: { items: [...], count: N } }
        // Фронтенд ожидает { items: [...], count: N }
        const vkResponse = vkData.response || {};
        res.json({
            items: vkResponse.items || [],
            count: vkResponse.count || 0
        });
    })
        .catch(err => {
        console.error('VK API error:', err);
        res.status(500).json({ error: 'Failed to fetch VK posts', items: [], count: 0 });
    });
});
// API Routes
app.use('/api/sitemap.xml', sitemapRouter);
app.use('/api/certificate', certificateAdminRouter);
app.use('/api', appointmentRouter);
app.use('/api', contactRouter);
// SSR Router - должен быть в конце для обработки всех остальных запросов
app.use(createSsrRouter());
// Start server
app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Server] Sitemap available at /api/sitemap.xml`);
    console.log(`[Server] Appointment API available at /api/appointment`);
    console.log(`[Server] Contact API available at /api/contact`);
});
export default app;
