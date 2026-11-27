# Личный кабинет врача/администратора — frontend ↔ backend

Кабинет: **`/personal-cabinet`** (`src/app/personal-cabinet/page.tsx`, `src/components/AdminCabinetPage.tsx`).
Маршрут скрыт от индексации (`src/app/seo.ts`) и исключён из sitemap.

---

## 1. Вход (реализован и на бекенде, и на фронте)

Форма входа находится **прямо на `/personal-cabinet`**: если сессии нет, страница
показывает форму «Вход в личный кабинет», а не дашборд.

Фронт (`src/services/auth.ts`):

1. При открытии кабинета вызывает `GET /api/auth/me` с `credentials: 'include'`.
2. Если ответ `401/403/404` — показывает форму входа.
3. Форма отправляет `POST /api/auth/login` с `{ "email": "...", "password": "..." }`
   и `credentials: 'include'` (бекенд также понимает legacy-поле `username`).
4. Бекенд ставит HttpOnly-cookie `session` (8 ч) и возвращает
   `{ "user": { id, email, name, role, archimed_doctor_id? }, "expiresAt" }`.
   Роуминг-токен в теле ответа не используется и не сохраняется в JS.
5. `POST /api/auth/logout` удаляет сессию на сервере и очищает cookie.
6. Все запросы идут на **относительные** пути `/api/*` (Next.js rewrite на
   `BACKEND_URL`), поэтому cookie отправляется на тот же origin.

Старые ключи `auth_token` / `user_data` в `localStorage` при входе очищаются,
чтобы их не подхватил session-guard.

### Роли на фронте

| Роль | Что видно |
|---|---|
| `admin`, `staff` (и легаси `manager`, `senior_manager`) | все блоки: врачи, прайс, записи, сертификаты; кнопка «Обновить все данные» и `POST /api/admin/archimed/refresh` |
| `doctor` | записи + публичные справочники врачей/услуг; блока сертификатов и обновления кэша нет |
| `patient` | доступ запрещён, показывается сообщение и форма входа |

Бекенд всё равно проверяет роль в guard-ах — фронт только скрывает лишнее.

---

## 2. Источники данных (все реальные)

| Блок | Источник | Endpoint |
|---|---|---|
| Врачи | Архимед | `GET /api/archimed/doctors` (публичный) |
| Прайс / услуги | Архимед | `GET /api/archimed/services` (публичный) |
| Ближайшие записи | Архимед через бекенд | `GET /api/admin/appointments/upcoming?limit=20` |
| Купленные сертификаты | заявки с сайта | `GET /api/certificate/admin/list?limit=20&includeFailed=true&includeUnsuccessful=true` |
| Инвалидация кэша | бекенд | `POST /api/admin/archimed/refresh` → 201 (только admin/staff) |

Моковых данных в кабинете нет. В `certificateAdminService.listCertificates`
для кабинета передаётся `{ allowFallback: false }`, поэтому при `401/403`
показывается форма входа, а не локальная фикстура.

`GET /api/archimed/talons` теперь тоже защищён сессией: клиент Archimed
отправляет `credentials: 'include'`; кабинет талоны напрямую не читает.

---

## 3. Ожидаемые форматы ответов

### 3.1. Ближайшие записи

```json
{
  "data": [
    {
      "id": 172014,
      "patient_name": "Борбай-оол Алдынай Кан-ооловна",
      "patient_phone": "79012002527",
      "preferred_date": "2026-11-29",
      "preferred_time": "12:50",
      "doctor_id": 1069,
      "doctor_name": "Кочаа Азияна Сержиевна",
      "service_id": 201,
      "service_name": "УЗИ органов брюшной полости",
      "status_id": 1
    }
  ],
  "total": 1
}
```

Фронт также tolerant к массиву без обёртки и к camelCase-полям. Важные правила
маппинга, которые уже соблюдены на бекенде:

- врач в талоне лежит в `docs[0]`, а не в `room_id`;
- `room_id` — кабинет, его нельзя подставлять как имя врача;
- услугу нужно джойнить со `talonservices`, иначе фронт покажет «Не указана в Archimed»;
- только будущие записи, сортировка по дате и времени.

### 3.2. Сертификаты

`AdminCertificate` из `src/services/certificateAdmin.ts`: `id`, `code`,
`nominalAmount`, `remainingAmount`, `status`, `createdAt`, `customerName`,
`customerPhone`, `payment.bankStatus`, `payment.bankStatusName` и т.д.

---

## 4. Env (бекенд)

```env
SESSION_COOKIE_NAME=session
SESSION_TTL_SECONDS=28800
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=lax
# SESSION_COOKIE_DOMAIN=.clinicaldan.ru
```

Миграция: `psql -U <user> -d <db> -f migrations/add-admin-cabinet-auth.sql`.

---

## 5. Что сделано на фронте

- Форма входа / выход / проверка сессии через `/api/auth/me`.
- Ролевое разделение блоков и кнопок.
- Записи идут через новый бекенд-эндпоинт, а не напрямую через `/api/archimed/talons`.
- Обновление: `POST /api/admin/archimed/refresh` → `refreshAllNow()` → перезагрузка данных.
- Ревалидация справочников при открытии и возврате во вкладку.
- При отсутствии `docs` в талоне — «Врач не указан в Archimed», а не название кабинета.
- `credentials: 'include'` во всех защищённых запросах; legacy-JWT из localStorage удаляется.

---

## 6. CRUD врачей и услуг

Для `admin`/`staff` в таблицах «Врачи» и «Прайс» добавлены кнопки «Добавить»,
«Изменить» и «Удалить». Фронт ожидает эндпоинты:

```text
POST   /api/admin/catalog/doctors
PATCH  /api/admin/catalog/doctors/:id
DELETE /api/admin/catalog/doctors/:id
POST   /api/admin/catalog/services
PATCH  /api/admin/catalog/services/:id
DELETE /api/admin/catalog/services/:id
```

Полное ТЗ для бекенда (схема БД, мержинг с Archimed, инвалидация кэша и
acceptance checklist) лежит в соседнем репозитории:

```text
../aldan-backend/ADMIN_CATALOG_TZ.md
```

Пока эти эндпоинты не задеплоены, кнопки будут показывать ошибку запроса;
остальной кабинет продолжает работать.
