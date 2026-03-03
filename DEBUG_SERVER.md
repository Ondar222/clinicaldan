# Диагностика «Cannot POST /api/certificate» на сервере

Выполни на сервере по шагам.

## 1. Откуда запущен бэкенд

```bash
pm2 show aldan-backend
```

Смотри поле **exec cwd** — это каталог, откуда запускается `server.js`. Дальше все команды выполняй **в этом каталоге**.

## 2. Обновлён ли код

```bash
cd /путь/из/шага/1
grep -n "api/certificate" server.js
```

Должны быть строки с `app.post('/api/certificate'` и `handleCreateCertificate`. Если ничего нет — на сервере старая версия, нужно заново выкатить код (git pull или загрузка файлов).

## 3. Отвечает ли бэкенд локально

```bash
curl -s http://127.0.0.1:5002/api/certificate/ping
```

Ожидается: `{"ok":true,"route":"api/certificate"}`.  
Если ошибка или пусто — бэкенд не слушает 5002 или не тот процесс (проверь порт в `pm2 show` и в `.env` / переменных окружения).

## 4. Обрабатывается ли POST

```bash
curl -s -X POST http://127.0.0.1:5002/api/certificate \
  -H "Content-Type: application/json" \
  -d '{"amount":1,"customer":{"firstName":"a","lastName":"b","email":"a@b.c"}}'
```

Должен вернуться JSON (ошибка валидации или ссылка на оплату), а не «Cannot POST».

## 5. Проксирует ли nginx

```bash
curl -s https://clinicaldan.ru/api/certificate/ping
```

Должно быть то же: `{"ok":true,"route":"api/certificate"}`.  
Если здесь ошибка или другой ответ, а шаг 3 прошёл — nginx не проксирует `/api/` на `localhost:5002`. Проверь конфиг nginx: должен быть блок `location /api/ { proxy_pass http://localhost:5002/api/; ... }` и перезагрузка: `sudo nginx -t && sudo systemctl reload nginx`.

## После правок

- Обновил код → `pm2 restart aldan-backend`
- Менял nginx → `sudo nginx -t && sudo systemctl reload nginx`
