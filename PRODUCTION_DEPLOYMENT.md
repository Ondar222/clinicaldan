# 🚀 Production Deployment Guide

## ❗ Ошибка "Unexpected token '<', '<!DOCTYPE '..."

Эта ошибка означает что **backend сервер не запущен** и nginx возвращает HTML страницу вместо JSON.

---

## ✅ Решение

### 1. Запустите backend сервер на production

```bash
# Подключитесь к серверу
ssh root@clinicaldan.ru

# Перейдите в директорию проекта
cd /var/www/clinicaldan

# Запустите backend через PM2 (рекомендуется)
pm2 start server.js --name clinicaldan-backend --env production
pm2 save
pm2 startup

# ИЛИ напрямую (не рекомендуется для production)
nohup node server.js > backend.log 2>&1 &
```

### 2. Проверьте что backend работает

```bash
# Проверка процесса
pm2 list

# Проверка логов
pm2 logs clinicaldan-backend

# Тест API
curl http://localhost:5002/health
curl http://localhost:5002/api/archimed/doctors?page=1
curl http://localhost:5002/vk/posts?count=3
```

### 3. Примените nginx конфигурацию

```bash
# Скопируйте конфиг
sudo cp nginx-config.conf /etc/nginx/sites-available/clinicaldan

# Создайте symlink
sudo ln -sf /etc/nginx/sites-available/clinicaldan /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск nginx
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx
```

### 4. Проверьте что всё работает

```bash
# Через nginx (production URL)
curl https://clinicaldan.ru/health
curl https://clinicaldan.ru/api/archimed/doctors?page=1
curl https://clinicaldan.ru/vk/posts?count=3

# Должны получить JSON, не HTML!
```

---

## 📋 nginx конфигурация

Файл: `/etc/nginx/sites-available/clinicaldan`

```nginx
server {
    listen 443 ssl http2;
    server_name clinicaldan.ru www.clinicaldan.ru;

    ssl_certificate /etc/letsencrypt/live/clinicaldan.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clinicaldan.ru/privkey.pem;

    # Backend API - Archimed
    location /api/ {
        proxy_pass http://localhost:5002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API - VK Posts
    location /vk/ {
        proxy_pass http://localhost:5002/vk/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API - Certificate
    location /certificate/ {
        proxy_pass http://localhost:5002/certificate/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5002/health;
    }

    # Frontend - Netlify fallback
    location / {
        try_files $uri $uri/ @netlify;
    }

    location @netlify {
        return 301 https://clinicaldan.ru$request_uri;
    }
}
```

---

## 🔧 PM2 команды

```bash
# Старт
pm2 start server.js --name clinicaldan-backend

# Рестарт
pm2 restart clinicaldan-backend

# Стоп
pm2 stop clinicaldan-backend

# Логи
pm2 logs clinicaldan-backend

# Статус
pm2 status

# Сохранить для автозапуска
pm2 save

# Настроить автозапуск
pm2 startup
```

---

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверьте логи
pm2 logs clinicaldan-backend --lines 50

# Проверьте что порт 5002 свободен
lsof -i :5002

# Проверьте .env файл
cat .env | grep VK_API_TOKEN
```

### Nginx не проксирует

```bash
# Проверка конфига
sudo nginx -t

# Проверка логов
sudo tail -f /var/log/nginx/error.log

# Перезапуск
sudo systemctl restart nginx
```

### API возвращает HTML

1. Проверьте что backend запущен: `pm2 list`
2. Проверьте что nginx проксирует: `sudo nginx -T | grep location`
3. Проверьте порты: `netstat -tlnp | grep 5002`

---

## 📊 Checklist

- [ ] Backend запущен (`pm2 list`)
- [ ] API отвечает (`curl localhost:5002/health`)
- [ ] Nginx проксирует (`sudo nginx -T`)
- [ ] SSL сертификаты действительны
- [ ] Firewall открывает 80/443 порты
- [ ] .env файл с токенами существует

---

## 📞 Контакты

При проблемах проверяйте:
1. `pm2 logs clinicaldan-backend`
2. `sudo tail -f /var/log/nginx/error.log`
3. `curl -v https://clinicaldan.ru/health`
