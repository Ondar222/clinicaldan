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
  logLevel: 'debug',
}));

// CORS для API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
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
