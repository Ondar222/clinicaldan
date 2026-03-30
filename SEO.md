# SEO Настройка - Клиника Алдан

## Подтверждённые файлы

### 1. Yandex Verification
- **Файл:** `/yandex_ddb71b8b525e49c3.html`
- **Мета-тег:** `<meta name="yandex-verification" content="ddb71b8b525e49c3" />`
- **Статус:** ✅ Готов к подтверждению в Яндекс.Вебмастере

## Мета-теги

### Основные
- **Title:** Клиника Алдан - современная медицинская клиника в Кызыле
- **Description:** Клиника Алдан - современная медицинская клиника с высококвалифицированными специалистами. Широкий спектр медицинских услуг в Кызыле.
- **Yandex Verification:** ddb71b8b525e49c3

### Open Graph (соцсети, мессенджеры)
- **og:type:** website
- **og:url:** https://clinicaldan.ru/
- **og:title:** Клиника Алдан - медицинская клиника в Кызыле
- **og:description:** Современная медицинская клиника с высококвалифицированными специалистами. Широкий спектр медицинских услуг.
- **og:image:** https://clinicaldan.ru/og-image.jpg
- **og:locale:** ru_RU

### Twitter Card
- **twitter:card:** summary_large_image
- **twitter:url:** https://clinicaldan.ru/
- **twitter:title:** Клиника Алдан - медицинская клиника в Кызыле
- **twitter:description:** Современная медицинская клиника с высококвалифицированными специалистами.

## Structured Data (Schema.org)

Добавлена микроразметка для медицинской организации:
- **@type:** MedicalOrganization
- **name:** Клиника Алдан
- **url:** https://clinicaldan.ru
- **medicalSpecialty:** GeneralMedical, LaboratoryScience
- **isAcceptingNewPatients:** true

## Файлы для поисковых систем

### robots.txt
Расположение: `/public/robots.txt`
- Настроены правила для Yandex, Googlebot и остальных роботов
- Закрыты технические страницы: `/staff`, `/certificates/success`, `/certificates/cancel`, `/api/`
- Указан sitemap: https://clinicaldan.ru/sitemap.xml

### sitemap.xml
Расположение: `/public/sitemap.xml`
- 14 основных страниц
- Приоритеты от 0.5 до 1.0
- Частота обновления: daily, weekly, monthly, yearly

### humans.txt
Расположение: `/public/humans.txt`
- Информация о команде разработчиков

## Рекомендации

### Для улучшения SEO:

1. **Создать OG Image**
   - Размер: 1200×630 px
   - Формат: JPG или PNG
   - Сохранить как `/public/og-image.jpg`

2. **Добавить реальный телефон**
   - Заменить `+7-394-22-00-00` на актуальный номер в Schema.org разметке

3. **Добавить точный адрес**
   - Указать полную адресную информацию в Schema.org

4. **Яндекс.Вебмастер**
   - Подтвердить права через файл или мета-тег
   - Добавить sitemap.xml
   - Настроить регион (Кызыл)

5. **Google Search Console**
   - Добавить сайт
   - Загрузить sitemap.xml
   - Проверить индексацию страниц

6. **Яндекс.Метрика**
   - Уже установлена (ID: 99344000)
   - Включены: вебвизор, карта кликов, отслеживание ссылок

## Проверка

### Локально
```bash
npm run build
npm run preview
```

### Валидация
- [Yandex Validator](https://webmaster.yandex.ru/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## Список файлов

```
/
├── index.html (SEO мета-теги, Schema.org)
├── sitemap.xml
├── yandex_ddb71b8b525e49c3.html
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── humans.txt
│   ├── yandex_ddb71b8b525e49c3.html
│   └── og-image-template.html
└── SEO.md (этот файл)
```

## Дата обновления
2026-03-31
