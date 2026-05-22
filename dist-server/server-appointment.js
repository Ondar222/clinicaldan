/**
 * Appointment Form Backend Handler
 * Отправляет заявки с формы записи на прием на clinicaldan@mail.ru
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
// POST /api/appointment
router.post('/appointment', async (req, res) => {
    try {
        const { patientName, patientPhone, patientEmail, preferredDate, preferredTime, comments, serviceName, servicePrice, doctorName } = req.body;
        console.log('[APPOINTMENT FORM] Received:', {
            patientName,
            patientPhone,
            patientEmail,
            preferredDate,
            preferredTime,
            comments: comments?.substring(0, 100) + '...',
            serviceName,
            servicePrice,
            doctorName,
            timestamp: new Date().toISOString()
        });
        // Валидация
        if (!patientName || !patientPhone) {
            return res.status(400).json({
                error: 'Имя и телефон обязательны'
            });
        }
        // Формирование текста письма
        const serviceInfo = serviceName
            ? `\nУслуга: ${serviceName}${servicePrice ? ` (${servicePrice} ₽)` : ''}`
            : '';
        const doctorInfo = doctorName
            ? `\nВрач: ${doctorName}`
            : '';
        const dateInfo = preferredDate
            ? `\nЖелаемая дата: ${preferredDate}`
            : '';
        const timeInfo = preferredTime
            ? `\nЖелаемое время: ${preferredTime}`
            : '';
        // Отправка email
        await transporter.sendMail({
            from: `"Сайт Клиники Алдан" <${process.env.MAIL_USERNAME}>`,
            to: 'clinicaldan@mail.ru',
            replyTo: patientEmail || patientPhone,
            subject: `📅 Новая запись: ${patientName}${serviceName ? ` - ${serviceName}` : ''}`,
            text: `
Новая заявка на запись на прием:

Имя: ${patientName}
Телефон: ${patientPhone}
Email: ${patientEmail || 'Не указан'}
${dateInfo}
${timeInfo}
${serviceInfo}
${doctorInfo}
Комментарий: ${comments || 'Нет'}

---
Отправлено с сайта clinicaldan.ru
      `.trim(),
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #720e9b;">📅 Новая запись на прием</h2>
  
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Имя:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${patientName}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Телефон:</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${patientPhone}">${patientPhone}</a></td>
    </tr>
    ${patientEmail ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
      <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${patientEmail}">${patientEmail}</a></td>
    </tr>
    ` : ''}
    ${preferredDate ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Желаемая дата:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${preferredDate}</td>
    </tr>
    ` : ''}
    ${preferredTime ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Желаемое время:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${preferredTime}</td>
    </tr>
    ` : ''}
    ${serviceName ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Услуга:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${serviceName}${servicePrice ? ` (${servicePrice} ₽)` : ''}</td>
    </tr>
    ` : ''}
    ${doctorName ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Врач:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${doctorName}</td>
    </tr>
    ` : ''}
    ${comments ? `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Комментарий:</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${comments}</td>
    </tr>
    ` : ''}
  </table>
  
  <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
    <p style="color: #666; font-size: 12px; margin: 0;">
      Отправлено с сайта <a href="https://clinicaldan.ru" style="color: #720e9b;">clinicaldan.ru</a>
    </p>
    <p style="color: #999; font-size: 11px; margin: 5px 0 0 0;">
      ${new Date().toLocaleString('ru-RU')}
    </p>
  </div>
</div>
      `
        });
        console.log('[APPOINTMENT FORM] Email sent successfully to clinicaldan@mail.ru');
        res.json({
            success: true,
            message: 'Заявка на запись успешно отправлена'
        });
    }
    catch (error) {
        console.error('[APPOINTMENT FORM] Error:', error);
        res.status(500).json({
            error: 'Ошибка отправки заявки',
            details: error.message
        });
    }
});
// Health check endpoint
router.get('/appointment/ping', (req, res) => {
    res.json({ ok: true, route: 'appointment' });
});
export default router;
