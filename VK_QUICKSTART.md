# 🚀 VK Posts - Быстрый старт

## ✅ Что сделано

1. **Красивые карточки** с фото, видео, ссылками и документами
2. **Адаптивный дизайн** (mobile-first)
3. **Статистика**: лайки ❤️, комментарии 💬, репосты 🔄, просмотры 👁️
4. **Работает везде**: локально и на production

---

## 🏠 Локальная разработка

### 1. Запуск backend

```bash
node server.js
```

### 2. Запуск frontend (в другом терминале)

```bash
npm run dev
```

### 3. Проверка

Откройте **http://localhost:5173/news**

---

## 🌐 Production

### 1. Сборка

```bash
npm run build
```

### 2. Запуск backend

```bash
# Прямой запуск
node server.js

# Или через PM2 (рекомендуется)
pm2 start server.js --name clinicaldan-vk
pm2 save
pm2 startup
```

### 3. Настройка Nginx

Скопируйте конфиг из `nginx-config.conf` в `/etc/nginx/sites-available/clinicaldan`:

```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/clinicaldan
sudo ln -sf /etc/nginx/sites-available/clinicaldan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Проверка

```bash
# Проверка backend
curl http://localhost:5002/vk/posts?count=3

# Проверка через nginx
curl https://clinicaldan.ru/vk/posts?count=3
```

---

## 📁 Структура

```
clinicaldan/
├── src/components/
│   └── VkNewsWidget.tsx      # Frontend компонент
├── vk/
│   ├── vk.service.js         # VK API сервис
│   └── vk.controller.js      # Контроллер
├── server.js                 # Backend сервер
├── .env                      # Переменные (VK_API_TOKEN)
└── nginx-config.conf         # Nginx конфигурация
```

---

## 🔧 Environment

В `.env` должны быть:

```env
VK_API_TOKEN=73849c1373849c1373849c138670bb86a27738473849c131a2089ea3553b2671f256178
VK_OWNER_ID=-128344113
```

---

## 🎨 Компонент

```tsx
import VkNewsWidget from './components/VkNewsWidget';

// Использование
<VkNewsWidget count={10} />
```

### Пропсы:
- `count` (default: 10) - количество постов
- `offset` (default: 0) - смещение для пагинации

---

## 📊 API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /vk/posts?count=10&offset=0` | Список постов |
| `GET /vk/posts/:id` | Конкретный пост |

---

## 🐛 Если что-то не работает

### Ошибка CORS
- Убедитесь что nginx проксирует `/vk` на backend

### Ошибка 404
- Проверьте что backend запущен: `pm2 logs clinicaldan-vk`
- Проверьте nginx: `sudo tail -f /var/log/nginx/error.log`

### Посты не грузятся
- Проверьте токен в `.env`
- Протестируйте напрямую: `curl "http://localhost:5002/vk/posts?count=3"`

---

## 📞 Поддержка

Документация:
- `VK_PRODUCTION_SETUP.md` - подробная настройка production
- `vk/README.md` - документация модуля
