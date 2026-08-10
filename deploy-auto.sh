#!/bin/bash
# АВТОМАТИЧЕСКИЙ деплой на продакшн
# Запуск: ./deploy-auto.sh

set -e

echo "🚀 Автоматический деплой clinicaldan.ru..."
echo ""

# НАСТРОЙКИ СЕРВЕРА
SERVER_USER="arslan"  # Твой юзер на сервере
SERVER_HOST="10.10.10.2"  # IP сервера
SERVER_PATH="/home/arslan/clinicaldan"  # Путь на сервере

# Шаг 1: Сборка
echo "📦 Сборка проекта..."
npm run build:all
echo "✅ Сборка завершена"
echo ""

# Шаг 2: Загрузка на сервер
echo "📤 Загрузка на сервер..."
rsync -avz --delete \
    dist/ \
    dist-server/ \
    .env.production \
    .env.server \
    nginx-config.conf \
    "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
echo "✅ Загрузка завершена"
echo ""

# Шаг 3: Перезапуск сервера
echo "🔄 Перезапуск сервера..."
ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && pm2 restart clinicaldan || node dist-server/src/server/index.js"
echo "✅ Сервер перезапущен"
echo ""

# Шаг 4: Перезагрузка nginx
echo "🔄 Перезагрузка nginx..."
ssh "${SERVER_USER}@${SERVER_HOST}" "sudo cp ${SERVER_PATH}/nginx-config.conf /etc/nginx/sites-enabled/clinicaldan && sudo nginx -t && sudo systemctl reload nginx"
echo "✅ Nginx перезапущен"
echo ""

# Шаг 5: Проверка
echo "🔍 Проверка API..."
sleep 3
curl -s -o /dev/null -w "📊 Архимед API: %{http_code}\n" "https://clinicaldan.ru/api/archimed/services?page=1&limit=5"
curl -s -o /dev/null -w "📊 VK API: %{http_code}\n" "https://clinicaldan.ru/api/vk/posts?count=5&offset=0"
echo ""

echo "✅ Деплой завершён!"
