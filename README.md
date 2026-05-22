# Клиника Алдан - Веб-сайт

Современный веб-сайт для медицинской клиники Алдан, разработанный с использованием React, TypeScript и Tailwind CSS.

## Особенности

- 🏥 Современный дизайн с брендингом клиники Алдан
- 📱 Адаптивный дизайн для всех устройств
- 🎨 Красная цветовая схема (RGB 210, 0, 46)
- 📊 Интеграция с Directus CMS
- 💰 Динамический прайс-лист с группировкой услуг
- 🔍 Поиск и фильтрация услуг
- 🎁 Покупка подарочных сертификатов
- 👤 Личный кабинет пациента
- ⚡ Быстрая загрузка и оптимизация
- 🔍 SEO-оптимизированный

## Технологии

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **CMS**: Directus
- **Сборка**: Vite
- **Стили**: Tailwind CSS с кастомными цветами
- **Роутинг**: React Router

## Установка и запуск

### Предварительные требования

- Node.js 18+ 
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Directus CMS Configuration
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_TOKEN=your_directus_token_here

# Archimed API Configuration
VITE_ARCHIMED_API_URL=https://your-archimed-api.com
VITE_ARCHIMED_API_TOKEN=your_archimed_token_here

# Services API Configuration
VITE_SERVICES_API_URL=https://your-api-endpoint.com/services

# Payment API Configuration
VITE_PAYMENT_API_URL=https://your-payment-api.com
VITE_PAYMENT_API_KEY=your_payment_api_key_here

# Email Configuration (for appointment & contact forms)
MAIL_URL=mail.hosting.reg.ru
MAIL_USERNAME=noreply@yurta.site
MAIL_PASSWORD=your_email_password

# App Configuration
VITE_SITE_NAME=Клиника Алдан
VITE_SITE_DESCRIPTION=Современная медицинская клиника с высококвалифицированными специалистами
```

### Запуск в режиме разработки

```bash
npm run dev
```

Сайт будет доступен по адресу: http://localhost:5173

### Запуск сервера API

Для работы форм записи и контактов необходимо запустить сервер:

```bash
# Если у вас есть Node.js на сервере
node dist/server/index.js
```

Сервер будет доступен на порту 3000 (или другом, указанном в PORT).

### Сборка для продакшена

```bash
npm run build
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── Header.tsx      # Шапка сайта
│   ├── Footer.tsx      # Подвал сайта
│   ├── Hero.tsx        # Главный баннер
│   ├── ServiceGrid.tsx # Сетка услуг
│   └── ...
├── services/           # Сервисы для работы с API
│   └── directus.ts    # Сервис для Directus CMS
├── types/              # TypeScript типы
│   ├── cms.ts         # Типы для CMS
│   └── doctors.ts     # Типы для врачей
└── App.tsx            # Главный компонент приложения
```

## Цветовая схема

Основные цвета клиники Алдан:

- **Основной красный**: `#d2002e` (RGB 210, 0, 46)
- **Темный красный**: `#b30026` (для hover эффектов)
- **Светлый красный**: `#e6334d` (для акцентов)
- **Темно-синий**: `#2c3e50` (для текста)
- **Белый**: `#ffffff` (фон)

## Интеграция с API

### Directus CMS

Сайт интегрирован с Directus CMS для управления контентом. Поддерживаемые типы контента:

- **Врачи**: информация о специалистах
- **Услуги**: медицинские услуги клиники
- **Отзывы**: отзывы пациентов
- **Новости**: новости клиники
- **Акции**: специальные предложения
- **FAQ**: часто задаваемые вопросы
- **Контакты**: контактная информация

### Archimed API

Сайт интегрирован с Archimed - информационной системой клиники. Поддерживаемые типы данных:

**Врачи:**
```typescript
interface ArchimedDoctor {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  type: string;
  branch: string;
  category: string;
  scientific_degree: string;
  max_time: string;
  phone: string;
  info: string;
  // ... другие поля
}
```

**Услуги:**
```typescript
interface ApiService {
  id: number;
  kind: number;
  code: string;
  name: string;
  altname: string;
  group_name: string;
  group_id: number;
  base_cost: number;
  cito_cost: number;
  duration: number;
  // ... другие поля
}
```

**Функциональность:**
- Получение списка врачей с фильтрацией
- Группировка услуг по категориям
- Поиск по ФИО, специальности, отделению
- Фильтрация врачей по отделениям и категориям
- Отображение срочных услуг (cito_cost)
- Интеграция с реальными данными клиники

## Настройка Directus

1. Установите Directus CMS
2. Создайте коллекции согласно типам в `src/types/cms.ts`
3. Настройте API токены
4. Обновите переменные окружения

## Развертывание

### Netlify

Сайт настроен для развертывания на Netlify. Файл `netlify.toml` содержит необходимые настройки.

### Другие платформы

Для развертывания на других платформах используйте команду:

```bash
npm run build
```

И загрузите содержимое папки `dist/` на ваш хостинг.

## Лицензия

© 2024 Клиника Алдан. Все права защищены.

## Настройка форм записи и контактов

### Email уведомления

Заявки с форм записи на прием и контактной формы отправляются на email:

**Получатель:** `clinicaldan@mail.ru`

### Настройка email

1. Убедитесь, что в `.env` указаны правильные данные:
   ```env
   MAIL_URL=mail.hosting.reg.ru
   MAIL_USERNAME=noreply@yurta.site
   MAIL_PASSWORD=your_email_password
   ```

2. Запустите API сервер после сборки:
   ```bash
   npm run build:server
   node api-server.js
   ```

### API endpoints

- **POST /api/appointment** - Запись на прием
- **POST /api/contact** - Контактная форма
- **GET /api/appointment/ping** - Проверка доступности
- **GET /api/contact/ping** - Проверка доступности

### Пример заявки на запись

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

### Запуск на продакшене

1. **Сборка проекта:**
   ```bash
   npm run build:all
   ```

2. **Запуск API сервера** (отдельный процесс):
   ```bash
   node api-server.js
   ```
   
   Сервер запустится на порту 3001 (или укажите `API_PORT` в `.env`).

3. **Настройка nginx** (опционально, для проксирования API):
   ```nginx
   location /api {
       proxy_pass http://localhost:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

### Важно!

- API сервер должен работать постоянно (используйте `pm2`, `systemd` или `docker`)
- Убедитесь, что порт 3001 открыт в фаерволе
- Настройте переменные окружения для SMTP сервера
