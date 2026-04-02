# Настройка контактной формы на отправку email

## 📧 Frontend обновлён

Файл `/src/components/ContactForm.tsx` теперь отправляет данные на `/api/contact`

**Получатель:** `clinicaldan@mail.ru`

**Данные формы:**
- Имя
- Телефон
- Email
- Сообщение

---

## 🔧 Backend настройка (на сервере)

### 1. Найди backend файл

```bash
pm2 show aldan-backend
# Смотри exec cwd — это каталог бэкенда

cd /path/to/backend
```

### 2. Добавь endpoint для контактной формы

Создай или обнови файл `server.js` (или `routes/contact.js`):

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email transporter из .env.server
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_URL,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// POST /api/contact
router.post('/contact', async (req, res) => {
  try {
    const { name, phone, email, message, recipient } = req.body;
    
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
Сообщение: ${message}

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
    
    res.json({ 
      success: true, 
      message: 'Заявка успешно отправлена' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Ошибка отправки заявки',
      details: error.message 
    });
  }
});

module.exports = router;
```

### 3. Подключи роут в main server.js

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contact');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://clinicaldan.ru'
}));

app.use(express.json());

// Подключи роуты
app.use('/api', contactRoutes);

// Остальные роуты...

const PORT = process.env.PORT || 5002;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Перезапусти backend

```bash
pm2 restart aldan-backend
pm2 logs aldan-backend --lines 50
```

---

## ✅ Проверка

### 1. Проверь что endpoint работает локально

```bash
curl -X POST http://127.0.0.1:5002/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест",
    "phone": "+7 (923) 317-60-60",
    "email": "test@test.ru",
    "message": "Тестовое сообщение",
    "recipient": "clinicaldan@mail.ru"
  }'
```

Ожидаемый ответ:
```json
{
  "success": true,
  "message": "Заявка успешно отправлена"
}
```

### 2. Проверь через браузер

1. Открой https://clinicaldan.ru
2. Прокрути до формы "Есть вопросы? Задавайте!"
3. Заполни форму
4. Нажми "Отправить"
5. Проверь почту `clinicaldan@mail.ru`

---

## 📊 Логирование

Добавь логирование для отслеживания отправок:

```javascript
// В начале route handler
console.log('[CONTACT FORM] Received:', {
  name,
  phone,
  email,
  message: message?.substring(0, 100) + '...',
  recipient,
  timestamp: new Date().toISOString()
});
```

---

## 🔒 Безопасность

### 1. Rate limiting (защита от спама)

```javascript
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 отправок
  message: 'Слишком много попыток. Попробуйте позже.'
});

router.post('/contact', contactLimiter, async (req, res) => {
  // ...
});
```

### 2. Sanitization данных

```javascript
const sanitizeHtml = require('sanitize-html');

// В начале handler
const cleanName = sanitizeHtml(name);
const cleanMessage = sanitizeHtml(message || '');
```

### 3. reCAPTCHA (опционально)

Добавь Google reCAPTCHA на frontend и валидацию на backend.

---

## 📧 Альтернатива: mailto fallback

Если backend недоступен, форма автоматически откроет почтовый клиент с заполненными данными:

```
mailto:clinicaldan@mail.ru?subject=Заявка с сайта ClinicalDan&body=...
```

---

## 🎯 Что делает форма сейчас

1. ✅ Собирает данные (имя, телефон, email, сообщение)
2. ✅ Проверяет валидацию (телефон ≥10 цифр, согласие принято)
3. ✅ Отправляет POST на `/api/contact`
4. ✅ Показывает успех/ошибку
5. ✅ Fallback на mailto если API недоступен

**Получатель:** `clinicaldan@mail.ru`
