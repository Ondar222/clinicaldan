/**
 * Main Server Entry Point
 * Объединяет API endpoints и SSR для продакшена
 */

import express from 'express';
import dotenv from 'dotenv';
import sitemapRouter from './sitemap.js';
import certificateAdminRouter from './certificateAdmin.js';
import { createSsrRouter } from './ssr.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// SSR Router - должен быть в конце для обработки всех остальных запросов
app.use(createSsrRouter());

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Sitemap available at /api/sitemap.xml`);
});

export default app;
