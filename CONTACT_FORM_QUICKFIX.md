# 🚀 Быстрая настройка контактной формы на сервере

## Проблема
```
404 Not Found - POST /api/contact
```

Backend endpoint не существует на сервере.

---

## ✅ Решение (5 минут)

### Шаг 1: Создай файл на сервере

Зайди на сервер и создай файл:

```bash
ssh user@clinicaldan.ru
cd /path/to/aldan-backend  # путь из pm2 show aldan-backend
nano routes/contact.js
```

### Шаг 2: Вставь код

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_URL || 'mail.hosting.reg.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME || 'noreply@yurta.site',
    pass: process.env.MAIL_PASSWORD
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
    Отправлено с сайта clinicaldan.ru
  </p>
</div>
      `
    });
    
    console.log('[CONTACT FORM] Email sent successfully');
    
    res.json({ 
      success: true, 
      message: 'Заявка успешно отправлена' 
    });
    
  } catch (error) {
    console.error('[CONTACT FORM] Error:', error);
    res.status(500).json({ 
      error: 'Ошибка отправки заявки',
      details: error.message 
    });
  }
});

// Health check
router.get('/contact/ping', (req, res) => {
  res.json({ ok: true, route: 'contact' });
});

module.exports = router;
```

### Шаг 3: Подключи роут в main server.js

Найди главный файл сервера (обычно `server.js` или `index.js`):

```bash
nano server.js
```

Добавь подключение роута:

```javascript
const contactRoutes = require('./routes/contact');

// ... другие импорты

app.use(express.json());
app.use('/api', contactRoutes);  // ← ДОБАВИТЬ ЭТУ СТРОКУ

// ... остальной код
```

### Шаг 4: Перезапусти backend

```bash
pm2 restart aldan-backend
pm2 logs aldan-backend --lines 20
```

### Шаг 5: Проверь

```bash
# Проверка endpoint
curl http://127.0.0.1:5002/api/contact/ping

# Тест отправки
curl -X POST http://127.0.0.1:5002/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест",
    "phone": "+79233176060",
    "email": "test@test.ru",
    "message": "Тестовое сообщение",
    "recipient": "clinicaldan@mail.ru"
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "message": "Заявка успешно отправлена"
}
```

---

## 📧 Проверка почты

1. Открой https://clinicaldan.ru
2. Прокрути до формы "Есть вопросы? Задавайте!"
3. Заполни форму
4. Нажми "Отправить"
5. **Проверь `clinicaldan@mail.ru`** - должно прийти письмо

---

## 🔍 Debugging

### Если всё ещё 404

```bash
# Проверь что роут подключен
pm2 logs aldan-backend | grep "contact"

# Проверь путь к файлу
ls -la /path/to/aldan-backend/routes/contact.js

# Перезапусти ещё раз
pm2 restart aldan-backend
```

### Если ошибка отправки email

```bash
# Проверь .env на сервере
cat /path/to/aldan-backend/.env | grep MAIL

# Должно быть:
MAIL_URL=mail.hosting.reg.ru
MAIL_USERNAME=noreply@yurta.site
MAIL_PASSWORD=eY5rT6dU8nbS0mH0
```

### Если не приходит письмо

1. Проверь спам
2. Проверь логи:
   ```bash
   pm2 logs aldan-backend --lines 100 | grep -i "contact"
   ```
3. Проверь что почтовый сервер доступен:
   ```bash
   telnet mail.hosting.reg.ru 465
   ```

---

## ✅ Всё работает!

Теперь заявки с формы будут приходить на `clinicaldan@mail.ru`

---

## 📁 Файлы

- **Frontend:** `/src/components/ContactForm.tsx` (обновлён ✅)
- **Backend template:** `/server-contact.ts` (в проекте)
- **Backend на сервере:** `/path/to/aldan-backend/routes/contact.js` (создать)
