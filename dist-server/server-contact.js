/**
 * Contact Form Backend Handler
 * Отправляет заявки с контактной формы на clinicaldan@mail.ru
 */
import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_URL || 'mail.hosting.reg.ru',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USERNAME || 'noreply@yurta.site',
        pass: process.env.MAIL_PASSWORD || ''
    }
});
// POST /api/contact
router.post('/contact', async (req, res) => {
    try {
        const { name, phone, email, message, recipient } = req.body;
        console.log('[CONTACT FORM] Received:', {
            name,
            phone,
            email,
            message: message?.substring(0, 100) + '...',
            recipient,
            timestamp: new Date().toISOString()
        });
        // Валидация
        if (!name || !phone || !email) {
            return res.status(400).json({
                error: 'Имя, телефон и email обязательны'
            });
        }
        // Отправка email
        await transporter.sendMail({
            from: `"Сайт Клиники Алдан" <${process.env.MAIL_USERNAME}>`,
            to: recipient || 'clinicaldan@mail.ru',
            replyTo: email,
            subject: `Заявка с сайта от ${name}`,
            text: `
Новая заявка с контактной формы:

Имя: ${name}
Телефон: ${phone}
Email: ${email}
Сообщение: ${message || 'Нет сообщения'}

---
Отправлено с сайта clinicaldan.ru
      `.trim(),
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #720e9b;">Новая заявка с сайта</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Имя:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Телефон:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Сообщение:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${message || 'Нет сообщения'}</td>
    </tr>
  </table>
  
  <p style="color: #666; font-size: 12px; margin-top: 20px;">
    Отправлено с сайта <a href="https://clinicaldan.ru" style="color: #720e9b;">clinicaldan.ru</a>
  </p>
</div>
      `
        });
        console.log('[CONTACT FORM] Email sent successfully');
        res.json({
            success: true,
            message: 'Заявка успешно отправлена'
        });
    }
    catch (error) {
        console.error('[CONTACT FORM] Error:', error);
        res.status(500).json({
            error: 'Ошибка отправки заявки',
            details: error.message
        });
    }
});
// Health check endpoint
router.get('/contact/ping', (req, res) => {
    res.json({ ok: true, route: 'contact' });
});
export default router;
