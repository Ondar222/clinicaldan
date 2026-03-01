# 🔧 Debug Production API Errors

## ❗ Ошибка сохраняется даже с запущенным бекендом

Если backend запущен, но ошибка "Unexpected token '<', '<!DOCTYPE '..." остаётся, значит **nginx не проксирует запросы на backend**.

---

## 📋 Диагностика

### 1. Проверьте что backend отвечает

```bash
# Прямо на сервере
curl http://localhost:5002/health
curl http://localhost:5002/api/archimed/doctors?page=1

# Должен быть JSON, не HTML!
```

### 2. Проверьте что nginx проксирует

```bash
# Проверка конфигурации nginx
sudo nginx -T | grep -A 10 "location /api/"

# Должно быть:
# location /api/ {
#     proxy_pass http://localhost:5002/api/;
#     ...
# }
```

### 3. Проверьте логи

```bash
# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Backend logs (если PM2)
pm2 logs clinicaldan-backend

# Backend logs (если напрямую)
tail -f backend.log
```

### 4. Проверьте какой URL использует frontend

Откройте DevTools в браузере (F12) → Network tab → найдите запрос к `/api/archimed/doctors`:

- **Request URL**: `https://clinicaldan.ru/api/archimed/doctors?page=1`
- **Status**: 500 (Internal Server Error)
- **Response**: HTML страница вместо JSON

---

## 🔧 Решение

### Вариант 1: Nginx проксирует на backend (рекомендуется)

**nginx.conf:**
```nginx
location /api/ {
    proxy_pass http://localhost:5002/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /vk/ {
    proxy_pass http://localhost:5002/vk/;
}

location /certificate/ {
    proxy_pass http://localhost:5002/certificate/;
}
```

**Применить:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Вариант 2: Frontend стучится напрямую на backend

Если не хотите использовать nginx proxy, измените `.env`:

```env
# Прямой доступ к backend (не рекомендуется для production)
VITE_ARCHIMED_API_URL=http://your-server-ip:5002/api/archimed
```

**Но!** Это потребует:
- Открыть порт 5002 в firewall
- Настроить CORS на backend
- HTTPS termination на backend

---

## 🧪 Тесты

### Проверка nginx proxy:

```bash
# Через nginx (должен проксировать на backend)
curl -v https://clinicaldan.ru/api/archimed/doctors?page=1

# Проверьте заголовки:
# < HTTP/2 200
# < content-type: application/json

# Если content-type: text/html — nginx не проксирует!
```

### Проверка backend:

```bash
# Прямо на backend
curl http://localhost:5002/health

# Ожидается:
# {"status":"ok","timestamp":"2025-..."}
```

---

## 🐛 Частые проблемы

### 1. Nginx не проксирует, а отдаёт статический файл

**Симптом:** `curl https://clinicaldan.ru/api/...` возвращает HTML

**Решение:** Проверьте порядок location в nginx.conf:

```nginx
# ❌ НЕПРАВИЛЬНО - try_files перехватывает всё
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {  # Сюда уже не дойдёт
    proxy_pass http://localhost:5002;
}

# ✅ ПРАВИЛЬНО - API до try_files
location /api/ {
    proxy_pass http://localhost:5002;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. Backend слушает только localhost

**Симптом:** nginx не может подключиться к backend

**Решение:** Убедитесь что backend слушает правильный интерфейс:

```javascript
// server.js
const PORT = process.env.PORT || 5002;
app.listen(PORT, '127.0.0.1', () => {  // или '0.0.0.0'
  console.log(`Server running on port ${PORT}`);
});
```

### 3. Firewall блокирует localhost

**Симптом:** nginx error log: `connect() failed (111: Connection refused)`

**Решение:**
```bash
# Проверьте что порт открыт
sudo netstat -tlnp | grep 5002

# Если нет — перезапустите backend
pm2 restart clinicaldan-backend
```

---

## ✅ Checklist

- [ ] Backend запущен и отвечает на `localhost:5002`
- [ ] nginx проксирует `/api/` на `localhost:5002`
- [ ] nginx.conf применён и перезапущен
- [ ] Firewall не блокирует localhost:5002
- [ ] CORS настроен (если нужно)
- [ ] Frontend использует правильный URL

---

## 📞 Быстрая проверка

```bash
# 1. Backend
curl http://localhost:5002/health

# 2. Nginx proxy
curl https://clinicaldan.ru/health

# 3. API
curl https://clinicaldan.ru/api/archimed/doctors?page=1

# Если 1 работает, а 2/3 нет — проблема в nginx!
```
