#!/bin/bash
# Деплой на продакшн clinicaldan.ru
# Запуск: ./deploy.sh

set -e  # Остановиться при первой ошибке

echo "🚀 Деплой clinicaldan.ru..."
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Шаг 1: Проверка git
echo -e "${YELLOW}Шаг 1/5: Проверка git${NC}"
if ! git diff --quiet; then
    echo -e "${RED}❌ Есть неизменённые файлы. Закоммитьте изменения перед деплоем.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Рабочая чистая${NC}"
echo ""

# Шаг 2: Сборка фронтенда
echo -e "${YELLOW}Шаг 2/5: Сборка фронтенда...${NC}"
npm run build
echo -e "${GREEN}✅ Фронтенд собран в dist/${NC}"
echo ""

# Шаг 3: Сборка сервера
echo -e "${YELLOW}Шаг 3/5: Сборка сервера...${NC}"
npm run build:server
echo -e "${GREEN}✅ Сервер собран в dist-server/${NC}"
echo ""

# Шаг 4: Проверка файлов
echo -e "${YELLOW}Шаг 4/5: Проверка файлов${NC}"
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Директория dist не найдена!${NC}"
    exit 1
fi
if [ ! -d "dist-server" ]; then
    echo -e "${RED}❌ Директория dist-server не найдена!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Все файлы на месте${NC}"
echo ""

# Шаг 5: Инструкция
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Сборка успешна! Теперь загрузите на сервер:${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "1. Загрузите файлы на сервер:"
echo ""
echo "   # Фронтенд (dist/)"
echo "   rsync -avz --delete dist/ user@194.58.90.133:/path/to/clinicaldan.ru/dist/"
echo ""
echo "   # Сервер (dist-server/, .env.production, nginx-config.conf)"
echo "   rsync -avz dist-server/ user@194.58.90.133:/path/to/clinicaldan.ru/dist-server/"
echo "   rsync -avz .env.production user@194.58.90.133:/path/to/clinicaldan.ru/"
echo "   rsync -avz nginx-config.conf user@194.58.90.133:/path/to/clinicaldan.ru/"
echo ""
echo "2. Перезапустите сервис на сервере:"
echo ""
echo "   cd /path/to/clinicaldan.ru"
echo "   pm2 restart clinicaldan || npm start &"
echo ""
echo "3. Перезагрузите nginx:"
echo ""
echo "   sudo cp nginx-config.conf /etc/nginx/sites-enabled/clinicaldan"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "4. Проверьте, что всё работает:"
echo ""
echo "   curl -s https://clinicaldan.ru/api/archimed/services?page=1&limit=5"
echo "   curl -s https://clinicaldan.ru/api/vk/posts?count=5&offset=0"
echo ""
echo -e "${YELLOW}Или используйте автоматический деплой (раскомментируйте):${NC}"
echo ""
echo "# rsync -avz --delete dist/ user@194.58.90.133:/path/to/clinicaldan.ru/dist/"
echo "# rsync -avz dist-server/ user@194.58.90.133:/path/to/clinicaldan.ru/dist-server/"
echo ""
