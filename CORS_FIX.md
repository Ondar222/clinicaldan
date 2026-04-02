# 🔧 Настройка CORS для контактной формы

## Проблема
```
Access to fetch at 'https://clinicaldan.ru/api/contact' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## ✅ Решение

### 1. Обнови backend на сервере

В файле `server.js` (или `index.js`) добавь CORS middleware:

```javascript
const cors = require('cors');

app.use(cors({
  origin: function(origin, callback) {
    // Разрешаем localhost для разработки
    const allowedOrigins = [
      'https://clinicaldan.ru',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // Разрешаем запросы без origin (mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Или более простой вариант (разрешить все)

```javascript
// ТОЛЬКО ДЛЯ РАЗРАБОТКИ!
app.use(cors({
  origin: true, // Разрешить все origin
  credentials: true
}));
```

### 3. Перезапусти backend

```bash
pm2 restart aldan-backend
```

---

## 🧪 Проверка

### 1. Проверь CORS заголовки

```bash
curl -X OPTIONS http://127.0.0.1:5002/api/contact \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Ожидаемые заголовки в ответе:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### 2. Проверь через браузер

1. Открой `http://localhost:5173`
2. Заполни форму
3. Отправь
4. **Не должно быть CORS ошибки**

---

## 📁 Полный код server.js

```javascript
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contact');

const app = express();

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://clinicaldan.ru',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parser
app.use(express.json());

// Routes
app.use('/api', contactRoutes);

// Остальной код...

const PORT = process.env.PORT || 5002;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🎯 Frontend уже обновлён

Файл `/src/components/ContactForm.tsx`:

```typescript
// В dev режиме используем относительный URL (через proxy)
const isDev = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL || 
  (isDev ? '/api' : 'https://clinicaldan.ru/api');
```

**Как работает:**
- **Dev (localhost:5173):** `/api/contact` → proxy → `localhost:5002/contact`
- **Production (clinicaldan.ru):** `/api/contact` → nginx → `localhost:5002/contact`

---

## ✅ Чеклист

- [ ] Добавлен CORS middleware в `server.js`
- [ ] Endpoint `/api/contact` существует
- [ ] Backend перезапущен (`pm2 restart`)
- [ ] Тест через curl проходит
- [ ] Тест через браузер работает

---

## 🔍 Debugging

### Если всё ещё CORS ошибка

1. **Проверь что CORS middleware подключён ДО роутов:**
   ```javascript
   app.use(cors(...)); // ← ПЕРВЫМ
   app.use(express.json());
   app.use('/api', contactRoutes);
   ```

2. **Проверь логи:**
   ```bash
   pm2 logs aldan-backend --lines 50 | grep -i cors
   ```

3. **Очисти кэш браузера:**
   ```
   Ctrl+Shift+Delete → Cache → Clear
   ```

4. **Проверь преflight запрос:**
   - Открой DevTools → Network
   - Отправь форму
   - Найди запрос `contact`
   - Посмотри на `Request Method: OPTIONS` (preflight)
   - Проверь response headers

---

## 📞 Альтернатива: nginx CORS

Если нет доступа к backend, настрой CORS в nginx:

```nginx
location /api/ {
    # CORS headers
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials true always;
    
    # Handle preflight
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain charset=UTF-8';
        add_header Content-Length 0;
        return 204;
    }
    
    proxy_pass http://localhost:5002/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

**Готово!** ✅ Теперь форма будет работать и на localhost, и на production.
