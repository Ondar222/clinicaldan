# VK Posts Module - Настройка для Production

## ✅ Что работает

1. **Локально (dev)**: Vite proxy перенаправляет `/vk` на `http://localhost:5002`
2. **Production**: Nginx проксирует `/vk` на backend сервер

## 📁 Файлы

- `src/components/VkNewsWidget.tsx` - компонент с красивыми карточками
- `vk/vk.service.js` - сервис для работы с VK API
- `vk/vk.controller.js` - контроллер
- `server.js` - backend endpoints (`/vk/posts`)

## 🔧 Настройка Production

### 1. Backend сервер

Запустите Node.js backend сервер:

```bash
cd /path/to/clinicaldan
node server.js
# или через PM2:
pm2 start server.js --name clinicaldan-backend
```

Сервер запустится на порту **5002**.

### 2. Nginx конфигурация

Добавьте в nginx config (`/etc/nginx/sites-available/clinicaldan`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend (Vite build)
    location / {
        root /path/to/clinicaldan/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API - VK Posts
    location /vk/ {
        proxy_pass http://localhost:5002/vk/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API - Certificate
    location /certificate/ {
        proxy_pass http://localhost:5002/certificate/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API - Health check
    location /health {
        proxy_pass http://localhost:5002/health;
    }
}
```

### 3. Environment variables (.env)

Убедитесь что в `.env` указаны правильные значения:

```env
# VK API Configuration
VK_API_TOKEN=73849c1373849c1373849c138670bb86a27738473849c131a2089ea3553b2671f256178
VK_OWNER_ID=-128344113
```

### 4. Перезапуск сервисов

```bash
# Backend
pm2 restart clinicaldan-backend

# Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🧪 Проверка

```bash
# Проверка backend
curl http://localhost:5002/vk/posts?count=3

# Проверка через nginx
curl https://your-domain.com/vk/posts?count=3
```

## 🎨 Компонент VkNewsWidget

### Возможности:
- ✅ Отображение фото (несколько в посте)
- ✅ Отображение видео с thumbnail и кнопкой play
- ✅ Отображение ссылок с preview
- ✅ Отображение документов
- ✅ Красивые карточки с hover эффектами
- ✅ Статистика: лайки, комментарии, репосты, просмотры
- ✅ Умное форматирование даты ("5 мин. назад", "2 дн. назад")
- ✅ Автообновление каждые 60 секунд
- ✅ Адаптивный дизайн (mobile-first)
- ✅ Работа и локально, и на production

### Использование:

```tsx
import VkNewsWidget from './components/VkNewsWidget';

// В компоненте
<VkNewsWidget count={10} />
```

## 📊 API Endpoints

### GET /vk/posts
```
Parameters:
- count (number, default: 10): количество постов
- offset (number, default: 0): смещение

Response:
{
  "items": [...],
  "count": 741
}
```

### GET /vk/posts/:id
```
Parameters:
- id (number): ID поста

Response:
{
  "id": 7199,
  "text": "...",
  "date": 1755594096,
  "likes": {"count": 14},
  ...
}
```

## 🐛 Troubleshooting

### Ошибка "User authorization failed"
- Проверьте что `VK_API_TOKEN` актуален
- Убедитесь что токен имеет права на `wall.get`

### Ошибка 404 на /vk/posts
- Проверьте что backend сервер запущен
- Проверьте nginx конфигурацию

### Посты не загружаются на production
1. Проверьте логи backend: `pm2 logs clinicaldan-backend`
2. Проверьте nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Убедитесь что CORS настроен правильно

## 📝 Примечания

- Токен `VK_API_TOKEN` - сервисный ключ сообщества, не истекает
- `VK_OWNER_ID` - отрицательный для сообществ (-128344113)
- Максимум 100 постов за один запрос к VK API
- Кэширование на 60 секунд для снижения нагрузки
