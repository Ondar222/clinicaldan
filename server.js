// Backend server for handling certificate and payment API requests
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { VkController } from './vk/vk.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Альфа-Банк конфигурация - ПРОДАКШН
const ALFA_BANK_URL = 'https://pay.alfabank.ru/payment/rest';
const ALFA_BANK_TOKEN = 'r37nq08sa80l4vdv9rcs4imt0j';
const ALFA_BANK_LOGIN = 'clinicaldan-operator';
const ALFA_BANK_PASSWORD = 'T2WpfN!Ftgq9WSB';

console.log(`🚀 Server started on port ${PORT}`);
console.log(`🔗 Alfa Bank URL: ${ALFA_BANK_URL} (PRODUCTION)`);

// Helper function to make requests to Alfa-Bank
async function requestAlfaBank(endpoint, data = {}) {
  const url = `${ALFA_BANK_URL}/${endpoint}`;

  // Для продакшн используем токен
  const params = new URLSearchParams({
    token: ALFA_BANK_TOKEN,
    ...data,
  });

  console.log(`🔗 Requesting ${url}`);
  console.log(`📋 Params:`, { ...data, token: '***' });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const result = await response.json();
    console.log(`📥 Response:`, result);
    return result;
  } catch (error) {
    console.error(`Alfa-Bank API error (${endpoint}):`, error);
    throw error;
  }
}

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `cert_${timestamp}_${random}`;
}

// POST /certificate - Create certificate and get payment URL
app.post('/certificate', async (req, res) => {
  try {
    const { amount, customer, sponsor, greetingText } = req.body;

    console.log('📝 Creating certificate:', { amount, customer, sponsor, greetingText });

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be greater than 0',
      });
    }

    if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
      return res.status(400).json({
        error: 'Invalid customer data',
        message: 'Customer email, firstName, and lastName are required',
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare request for Alfa-Bank
    const description = `Подарочный сертификат на сумму ${amount} ₽`;
    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates/success?orderId=${orderNumber}`;
    const failUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/certificates/cancel?orderId=${orderNumber}`;

    // Register order in Alfa-Bank (token authentication only - no username/password)
    const alfaResult = await requestAlfaBank('register.do', {
      orderNumber: orderNumber,
      amount: amount, // Amount in rubles
      returnUrl: returnUrl,
      failUrl: failUrl,
      description: description,
      language: 'ru',
    });

    console.log('✅ Alfa-Bank response:', alfaResult);

    if (alfaResult.errorCode) {
      throw new Error(alfaResult.errorMessage || `Alfa-Bank error: ${alfaResult.errorCode}`);
    }

    // Return success response
    res.json({
      message: 'Certificate created successfully',
      code: orderNumber,
      paymentUrl: alfaResult.formUrl,
      orderId: orderNumber,
    });
  } catch (error) {
    console.error('❌ Error creating certificate:', error);
    res.status(500).json({
      error: 'Certificate creation failed',
      message: error.message || 'Internal server error',
    });
  }
});

// POST /certificate/check-payment/:orderNumber - Check payment status
app.post('/certificate/check-payment/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    console.log('🔍 Checking payment status for order:', orderNumber);

    // Check order status in Alfa-Bank (token authentication only)
    const alfaResult = await requestAlfaBank('getOrderStatusExtended.do', {
      orderNumber: orderNumber,
    });

    console.log('✅ Alfa-Bank status response:', alfaResult);

    if (alfaResult.errorCode) {
      throw new Error(alfaResult.errorMessage || `Alfa-Bank error: ${alfaResult.errorCode}`);
    }

    // Map Alfa-Bank status to our format
    // 0 - registered but not paid
    // 1 - pre-authorized (hold)
    // 2 - fully authorized (paid)
    // 3 - authorization cancelled
    // 4 - refund processed
    // 5 - ACS authentication initiated
    // 6 - authorization declined
    const statusMap = {
      0: 'pending',
      1: 'pending',
      2: 'paid',
      3: 'cancelled',
      4: 'refunded',
      5: 'pending',
      6: 'declined',
    };

    res.json({
      orderStatus: alfaResult.orderStatus,
      orderNumber: alfaResult.orderNumber,
      amount: alfaResult.amount ? alfaResult.amount / 100 : 0, // Convert from kopecks
      currency: alfaResult.currency,
      status: statusMap[alfaResult.orderStatus] || 'unknown',
      paid: alfaResult.orderStatus === 2,
      pan: alfaResult.pan,
      cardholderName: alfaResult.cardholderName,
      approvalCode: alfaResult.approvalCode,
    });
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    res.status(500).json({
      error: 'Payment status check failed',
      message: error.message || 'Internal server error',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// VK API Endpoints
app.get('/vk/posts', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await VkController.getPosts(count, offset);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in /vk/posts:', error);
    res.status(500).json({
      error: 'Failed to fetch VK posts',
      message: error.message || 'Internal server error',
    });
  }
});

app.get('/vk/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const result = await VkController.getPostById(postId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('❌ Error in /vk/posts/:id:', error);
    res.status(500).json({
      error: 'Failed to fetch VK post',
      message: error.message || 'Internal server error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
