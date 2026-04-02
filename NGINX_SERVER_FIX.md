# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сайт не работает на смартфонах

## ✅ Проблема найдена

**Backend работает:**
```bash
netstat -tlnp | grep 5002
tcp6  0  0 :::5002  :::*  LISTEN  759060/node
```

**API отвечает:**
```bash
curl http://127.0.0.1:5002/api/archimed/services
{"data":[...],"total":"3646",...}  ✅
```

**НО nginx НЕ проксирует запросы на backend!**

---

## 🔧 Решение на сервере

### 1. Зайди на сервер по SSH

```bash
ssh root@clinicaldan.ru
# или
ssh user@clinicaldan.ru
```

### 2. Найди nginx конфиг

```bash
# Вариант 1
cat /etc/nginx/sites-enabled/clinicaldan.ru

# Вариант 2
cat /etc/nginx/conf.d/clinicaldan.conf

# Вариант 3
find /etc/nginx -name "*.conf" | xargs grep -l "clinicaldan"
```

### 3. Добавь proxy для /api/

**Открой конфиг:**
```bash
nano /etc/nginx/sites-enabled/clinicaldan.ru
# или где у тебя конфиг
```

**Добавь location для API:**

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name clinicaldan.ru www.clinicaldan.ru;
    
    # SSL сертификаты (если есть)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Статика (фронтенд)
    location / {
        root /var/www/aldan-site.bak/dist;  # или где у тебя dist
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # ← ДОБАВИТЬ ЭТО БЛОК ДЛЯ API
    location /api/ {
        # CORS headers
        add_header Access-Control-Allow-Origin $scheme://$http_host always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, Accept" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4. Проверь и перезагрузи nginx

```bash
# Проверка конфига
nginx -t

# Если OK - перезагрузи
systemctl reload nginx

# Если ошибка - смотри лог
tail -50 /var/log/nginx/error.log
```

### 5. Проверь что работает

```bash
# Проверка с внешнего IP (не localhost!)
curl -v https://clinicaldan.ru/api/archimed/services?page=1&limit=10

# Должно вернуть JSON с услугами
```

---

## 📱 Проверка на смартфоне

1. Открой https://clinicaldan.ru на iPhone/Android (через мобильный интернет!)
2. Открой DevTools (Remote Debugging)
3. Посмотри Network tab
4. **Запросы на `/api/archimed/services` должны работать (200 OK)**

---

## 🔍 Debugging

### Если nginx -t выдает ошибку

```bash
# Смотри что именно не так
nginx -t 2>&1

# Частые ошибки:
# - missing semicolon → пропустили ;
# - unknown directive → опечатка в директиве
# - invalid parameter → неверный параметр
```

### Если 502 Bad Gateway

```bash
# Проверь что backend работает
pm2 status
pm2 logs aldan-backend --lines 20

# Проверь что порт открыт
netstat -tlnp | grep 5002

# Если backend не работает
pm2 restart aldan-backend
```

### Если CORS ошибка

```bash
# Проверь заголовки
curl -v -X OPTIONS https://clinicaldan.ru/api/contact \
  -H "Origin: https://clinicaldan.ru" \
  -H "Access-Control-Request-Method: POST"

# Должны быть заголовки:
# Access-Control-Allow-Origin: https://clinicaldan.ru
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## ✅ Чеклист

- [ ] SSH на сервере
- [ ] nginx конфиг найден
- [ ] location /api/ добавлен
- [ ] nginx -t прошёл
- [ ] nginx перезапущен
- [ ] curl тест работает
- [ ] На смартфоне сайт открывается

---

## 📄 Полный nginx конфиг (пример)

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name clinicaldan.ru www.clinicaldan.ru;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/clinicaldan.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clinicaldan.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
    
    # Frontend
    location / {
        root /var/www/aldan-site.bak/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
    
    # Backend API
    location /api/ {
        add_header Access-Control-Allow-Origin $scheme://$http_host always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, Accept" always;
        add_header Access-Control-Allow-Credentials true always;
        
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin $scheme://$http_host always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, Accept" always;
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
        
        proxy_pass http://127.0.0.1:5002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Logs
    access_log /var/log/nginx/clinicaldan.access.log;
    error_log /var/log/nginx/clinicaldan.error.log;
}
```

---

**После настройки nginx сайт будет работать на смартфонах!** ✅
