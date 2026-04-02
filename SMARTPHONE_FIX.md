# 🔧 Срочное исправление: Сайт не работает на смартфонах

## Проблема
```
Safari не удается открыть страницу, так как он не смог подключиться к серверу
```

## ✅ Причина

1. **CORS блокировка** - Safari на iOS строже к CORS
2. **Endpoint не существует** - `/api/contact` нет на сервере
3. **Относительный URL** - теперь используем `/api/contact` вместо абсолютного URL

---

## 🚀 Решение на сервере

### 1. Обнови nginx конфиг

```bash
ssh user@clinicaldan.ru
sudo nano /etc/nginx/sites-available/clinicaldan.ru
```

**Добавь location для /api/contact:**

```nginx
location /api/ {
    # CORS headers - РАЗРЕШИТЬ ВСЕ ДЛЯ ОДНОГО ДОМЕНА
    add_header Access-Control-Allow-Origin $scheme://$http_host always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, Accept" always;
    add_header Access-Control-Allow-Credentials true always;
    
    # Handle preflight request
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $scheme://$http_host always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, Accept" always;
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain charset=UTF-8';
        add_header Content-Length 0;
        return 204;
    }
    
    # Proxy to backend
    proxy_pass http://127.0.0.1:5002/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Перезагрузи nginx:**
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Создай backend endpoint

```bash
cd /path/to/aldan-backend
mkdir -p routes
nano routes/contact.js
```

**Вставь код:**

```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_URL || 'mail.hosting.reg.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME || 'noreply@yurta.site',
    pass: process.env.MAIL_PASSWORD
  }
});

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
    
    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Имя, телефон и email обязательны' });
    }
    
    await transporter.sendMail({
      from: `"Сайт Клиники Алдан" <${process.env.MAIL_USERNAME}>`,
      to: recipient || 'clinicaldan@mail.ru',
      replyTo: email,
      subject: `Заявка с сайта от ${name}`,
      text: `
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
    
    res.json({ success: true, message: 'Заявка успешно отправлена' });
    
  } catch (error) {
    console.error('[CONTACT FORM] Error:', error);
    res.status(500).json({ error: 'Ошибка отправки', details: error.message });
  }
});

router.get('/contact/ping', (req, res) => {
  res.json({ ok: true, route: 'contact' });
});

module.exports = router;
```

### 3. Подключи роут в server.js

```bash
nano server.js
```

**Добавь:**

```javascript
const cors = require('cors');
const contactRoutes = require('./routes/contact');

// CORS - ДОБАВИТЬ ПЕРЕД РОУТАМИ
app.use(cors({
  origin: true, // Разрешить все (nginx проверит)
  credentials: true
}));

app.use(express.json());

// Роуты
app.use('/api', contactRoutes); // ← ДОБАВИТЬ
```

### 4. Перезапусти backend

```bash
pm2 restart aldan-backend
pm2 logs aldan-backend --lines 20
```

---

## ✅ Проверка

### 1. Проверь nginx

```bash
curl -I https://clinicaldan.ru/api/contact/ping
```

**Ожидаемые заголовки:**
```
Access-Control-Allow-Origin: https://clinicaldan.ru
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### 2. Проверь endpoint

```bash
curl -X POST https://clinicaldan.ru/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79233176060","email":"test@test.ru","message":"Тест","recipient":"clinicaldan@mail.ru"}'
```

**Ожидаемый ответ:**
```json
{"success":true,"message":"Заявка успешно отправлена"}
```

### 3. Проверь на смартфоне

1. Открой https://clinicaldan.ru на iPhone/Android
2. Прокрути до формы "Есть вопросы? Задавайте!"
3. Заполни форму
4. Нажми "Отправить"
5. **Должно работать!**

---

## 🎯 Почему это работает

**Frontend:**
```javascript
// Относительный URL - работает на любом домене
const endpoint = '/api/contact';
```

**Цепочка:**
```
Safari на iPhone
  ↓
https://clinicaldan.ru/api/contact
  ↓
nginx (CORS headers)
  ↓
localhost:5002/api/contact
  ↓
nodemailer → clinicaldan@mail.ru
```

---

## 📱 Почему Safari на iPhone блокировал

1. **Абсолютный URL** - `https://clinicaldan.ru/api/contact` с localhost
2. **CORS preflight** - Safari делает OPTIONS запрос перед POST
3. **Нет CORS заголовков** - nginx не добавлял Access-Control-Allow-Origin

**Решение:**
- ✅ Относительный URL (`/api/contact`)
- ✅ CORS в nginx
- ✅ CORS в backend

---

## 🚨 Экстренное временное решение

Если нет доступа к серверу прямо сейчас:

**Отключи отправку формы** пока не настроишь backend:

```javascript
// В ContactForm.tsx
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Временное решение - только mailto
  const subject = encodeURIComponent('Заявка с сайта ClinicalDan');
  const body = encodeURIComponent(
    `Имя: ${formData.name}\n` +
    `Телефон: ${formData.phone}\n` +
    `Email: ${formData.email}\n` +
    `Сообщение: ${formData.message}`
  );
  
  window.location.href = `mailto:clinicaldan@mail.ru?subject=${subject}&body=${body}`;
};
```

**Сайт будет работать**, но форма будет открывать почтовый клиент.

---

## ✅ Чеклист

- [ ] nginx настроен (CORS + proxy)
- [ ] backend endpoint создан
- [ ] CORS middleware добавлен
- [ ] pm2 restart сделан
- [ ] curl тест прошёл
- [ ] на смартфоне работает

---

**Сборка готова!** ✅ 

После настройки nginx и backend форма будет работать на всех устройствах.
