# Исправление SQL-ошибки на Production Бэкенде

## Проблема

При списании средств с сертификата возникает ошибка:
```
Error: FOR UPDATE не может применяться к NULL-содержащей стороне внешнего соединения
POST /api/certificate/admin/redeem 500
```

## Корневая причина

В методе `redeemCertificate` используется `FOR UPDATE` (пессимистическая блокировка) вместе с `LEFT JOIN`, что PostgreSQL не позволяет делать.

**Ошибка в коде:**
```typescript
// ❌ НЕПРАВИЛЬНО
await this.certificateRepository
  .createQueryBuilder('certificate')
  .leftJoin('certificate.payment', 'payment')  // LEFT JOIN
  .where('certificate.code = :code', { code })
  .setLock('pessimistic_write')                // FOR UPDATE
  .getOne();
```

## Решение

### Вариант 1: Убрать JOIN из запроса с блокировкой (рекомендуется)

Разделить запросы:
1. Сначала получить сертификат с блокировкой
2. Затем сделать JOIN отдельным запросом при необходимости

```typescript
// ✅ ПРАВИЛЬНО - Шаг 1: Получаем сертификат с блокировкой
const certificate = await this.certificateRepository
  .createQueryBuilder('certificate')
  .where('certificate.code = :code', { code })
  .setLock('pessimistic_write')
  .getOne();

if (!certificate) {
  throw new BadRequestException('Сертификат не найден');
}

// ✅ ПРАВИЛЬНО - Шаг 2: Получаем информацию об оплате отдельным запросом
const payment = await this.paymentRepository.findOne({
  where: { certificateId: certificate.id },
});

// Выполняем списание
certificate.remainingAmount -= writeOffAmount;
certificate.status = certificate.remainingAmount === 0 ? 'used' : 'partially_used';
await this.certificateRepository.save(certificate);
```

### Вариант 2: Использовать INNER JOIN вместо LEFT JOIN

Если payment обязательно должен существовать:

```typescript
// ✅ ПРАВИЛЬНО - INNER JOIN вместо LEFT JOIN
const certificate = await this.certificateRepository
  .createQueryBuilder('certificate')
  .innerJoin('certificate.payment', 'payment')
  .where('certificate.code = :code', { code })
  .setLock('pessimistic_write')
  .getOne();
```

### Вариант 3: Убрать блокировку (если не критично)

```typescript
// ✅ ПРАВИЛЬНО - без блокировки
const certificate = await this.certificateRepository.findOne({
  where: { code },
  relations: ['payment'],
});
```

## Инструкция по деплою

### 1. Подключиться к production серверу

```bash
ssh user@clinicaldan.ru
```

### 2. Перейти в папку бэкенда

```bash
cd /var/www/aldan-backend
```

### 3. Открыть файл с методом списания

```bash
# Найти файл с методом redeemCertificate
grep -r "redeemCertificate" src/ --include="*.ts"

# Обычно это:
nano src/certificate/certificate.service.ts
# или
vim src/certificate/certificate.service.ts
```

### 4. Найти проблемный запрос

```bash
# Поиск по ключевым словам
grep -n "setLock\|FOR UPDATE\|pessimistic" src/certificate/certificate.service.ts
```

### 5. Применить исправление

Замените проблемный код на один из вариантов выше.

### 6. Перекомпилировать и перезапустить

```bash
# Очистить кэш
rm -rf dist .cache node_modules/.cache

# Перекомпилировать TypeScript
npm run build

# Перезапустить через PM2
pm2 restart aldan-backend

# Проверить логи
pm2 logs aldan-backend --lines 30
```

### 7. Проверить работу

```bash
# Тестовый запрос
curl -X POST http://localhost:5002/api/certificate/admin/redeem \
  -H "Content-Type: application/json" \
  -d '{"code": "0000058", "writeOffAmount": 5000, "reason": "Тест"}'

# Ожидается ответ:
# {"message":"Списание выполнено","operationId":"op_xxx","certificate":{...}}
```

## Проверка в БД

### Проверить баланс сертификата

```bash
psql -h 127.0.0.1 -p 9876 -U admin -d aldan -c \
  "SELECT code, balance/100 as balance_rub, status FROM certificates WHERE code = '0000058';"
```

Ожидается:
```
 code  | balance_rub |  status
-------+-------------+------------
 0000058 |        0 | used
```

### Проверить историю списаний

```bash
psql -h 127.0.0.1 -p 9876 -U admin -d aldan -c \
  "SELECT created_at, write_off_amount/100 as write_off_rub, 
          remaining_amount_after/100 as remaining_rub, reason 
   FROM spend_history 
   WHERE certificate_code = '0000058' 
   ORDER BY created_at DESC LIMIT 1;"
```

Ожидается:
```
         created_at         | write_off_rub | remaining_rub | reason
----------------------------+---------------+---------------+---------
 2025-01-15 14:30:00.000000 |          5000 |             0 | Тест
```

## Дополнительные миграции БД (если нужны)

### Исправить тип колонки certificate_code

```bash
psql -h <production_host> -U admin -d aldan <<EOF
-- Изменить тип с integer на VARCHAR(255)
ALTER TABLE spend_history 
  ALTER COLUMN certificate_code TYPE VARCHAR(255) 
  USING certificate_code::text;

-- Добавить индекс для быстрого поиска
CREATE UNIQUE INDEX IF NOT EXISTS idx_spend_history_operation_id 
  ON spend_history(operation_id);
EOF
```

## Чек-лист после деплоя

- [ ] Бэкенд перекомпилирован (`npm run build`)
- [ ] PM2 процесс перезапущен (`pm2 restart aldan-backend`)
- [ ] Нет ошибок в логах (`pm2 logs --err`)
- [ ] Тестовое списание прошло успешно
- [ ] Баланс сертификата обновился в БД
- [ ] Запись появилась в `spend_history`
- [ ] Фронтенд отображает новый баланс

## Контакты

Если возникнут проблемы — обратитесь к фронтенд-разработчику или проверьте логи:

```bash
# Логи бэкенда
pm2 logs aldan-backend

# Логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

**Дата создания:** 2025-01-15  
**Версия:** 1.0
