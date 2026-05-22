# API Server Setup

## Описание

API сервер обрабатывает заявки с форм:
- Запись на прием (`/api/appointment`)
- Контактная форма (`/api/contact`)

Обе формы отправляют email на `clinicaldan@mail.ru`

## Запуск

### 1. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

Обязательно заполните:
```env
MAIL_USERNAME=ваш_email@hosting.reg.ru
MAIL_PASSWORD=пароль_от_emails
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск API сервера

```bash
npm run api-server
```

Сервер запустится на порту 5000 (или другом, указанном в `API_PORT`).

## API Endpoints

### POST /api/appointment

Запись на прием к врачу.

**Request Body:**
```json
{
  "patientName": "Иванов Иван",
  "patientPhone": "+7 (999) 123-45-67",
  "patientEmail": "ivanov@example.com",
  "preferredDate": "2024-12-01",
  "preferredTime": "14:00",
  "comments": "Первичный прием",
  "serviceName": "Консультация косметолога",
  "servicePrice": 2500,
  "doctorName": "Петрова Анна"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Заявка на запись успешно отправлена"
}
```

### POST /api/contact

Контактная форма.

**Request Body:**
```json
{
  "name": "Иванов Иван",
  "phone": "+7 (999) 123-45-67",
  "email": "ivanov@example.com",
  "message": "Вопрос по услугам",
  "recipient": "clinicaldan@mail.ru"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Заявка успешно отправлена"
}
```

### GET /api/appointment/ping

Проверка доступности API.

**Response:**
```json
{
  "ok": true,
  "route": "appointment"
}
```

### GET /api/contact/ping

Проверка доступности API.

**Response:**
```json
{
  "ok": true,
  "route": "contact"
}
```

## Разработка

### Запуск в режиме разработки

Откройте два терминала:

**Терминал 1 - API сервер:**
```bash
npm run api-server
```

**Терминал 2 - Frontend:**
```bash
npm run dev
```

Frontend будет на http://localhost:5173, API будет проксироваться на порт 5000.

## Производство

### Сборка и запуск

```bash
npm run build:all
node api-server.js
```

### Docker (опционально)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:all
EXPOSE 5000
CMD ["node", "api-server.js"]
```

## Troubleshooting

### Ошибка: "Cannot POST /api/appointment"

Убедитесь, что:
1. API сервер запущен (`npm run api-server`)
2. Порт 5000 не занят
3. Vite прокси настроен на `http://localhost:5000`

### Ошибка отправки email

Проверьте:
1. Правильность `MAIL_USERNAME` и `MAIL_PASSWORD` в `.env`
2. Что SMTP сервер доступен (порт 465, SSL)
3. Логирование в консоли сервера

## Поддержка

При проблемах смотрите логи в консоли сервера:
```
[APPOINTMENT FORM] Received: {...}
[APPOINTMENT FORM] Email sent successfully to clinicaldan@mail.ru
```
