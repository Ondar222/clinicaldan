# Бэкенд в другой папке (порт 5002)

Если бэкенд запущен **не** из этой папки (clinicaldan), он не видит `.env` и `.back.env` отсюда.

## Варианты

### 1. Скопировать env в папку бэкенда

Скопируйте файл с переменными в каталог, откуда запускается бэкенд:

```bash
cp /путь/к/clinicaldan/.back.env /путь/к/вашему/бэкенду/.env
```

Либо создайте там `.env` вручную и продублируйте нужные переменные из `clinicaldan/.back.env` или `clinicaldan/.env` (PORT, CORS_ORIGIN, Alfa-Bank, VK, SMTP и т.д.).

### 2. Запуск с указанием пути к env

Запускать бэкенд с загрузкой env из clinicaldan:

```bash
cd /путь/к/вашему/бэкенду
dotenv -e /путь/к/clinicaldan/.back.env -- node your-server.js
```

Или через `env` (если используете dotenv в коде бэкенда и он читает `DOTENV_CONFIG_PATH`):

```bash
export DOTENV_CONFIG_PATH=/путь/к/clinicaldan/.back.env
node your-server.js
```

### 3. Минимум для API сертификатов

Чтобы работали запросы с фронта (Vite → localhost:5002), в бэкенде должны быть хотя бы:

- `PORT=5002`
- `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`
- переменные для Альфа-Банка (токен, URL и т.д.), если бэкенд сам ходит в банк

Остальное — по необходимости (БД, VK, SMTP).
