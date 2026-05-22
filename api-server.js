/**
 * Simple API Server for Appointment & Contact Forms
 * Запуск: node api-server.js
 */

import express from 'express';
import dotenv from 'dotenv';
import appointmentRouter from './dist-server/server-appointment.js';
import contactRouter from './dist-server/server-contact.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(express.json());

// CORS
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
app.use('/api', appointmentRouter);
app.use('/api', contactRouter);

// Start server
app.listen(PORT, () => {
  console.log(`[API Server] Running on port ${PORT}`);
  console.log(`[API Server] Appointment API: http://localhost:${PORT}/api/appointment`);
  console.log(`[API Server] Contact API: http://localhost:${PORT}/api/contact`);
});
