# Исправления для бэкенда (порт 5002)

## Проблема 1: Сертификат активируется сразу после создания

**Где искать:** Файл обработчика создания сертификата (скорее всего `/certificate` или `/api/certificate`)

**Что сейчас:** При создании сертификата он сразу помечается как использованный/активированный

**Что нужно сделать:**

### Вариант A: Если есть таблица certificates в БД

1. Добавить поле `is_active` (boolean, по умолчанию `false`)
2. Добавить поле `activated_at` (timestamp, nullable)
3. При создании сертификата: `is_active = false`
4. При успешной оплате (статус 2 от Альфа-Банка): `is_active = true`, `activated_at = NOW()`

```sql
-- Пример миграции
ALTER TABLE certificates 
  ADD COLUMN is_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN activated_at TIMESTAMP NULL;
```

### Вариант B: Если статус хранится в order_status

Изменить логику:
- При создании: `order_status = 0` (зарегистрирован, не оплачен)
- При успехе оплаты (callback от банка): `order_status = 2` (оплачен, активен)
- Сертификат действителен только при `order_status = 2`

## Проблема 2: Нет уведомления о неудачной оплате

**Где искать:** Обработчик callback'ов от Альфа-Банка или проверка статуса платежа

**Что нужно сделать:**

### 1. Добавить отправку email при неудачной оплате

```javascript
// В обработчике payment status / callback
const sendPaymentFailedEmail = async (orderData) => {
  const { customer_email, order_id, amount } = orderData;
  
  await nodemailer.sendMail({
    from: process.env.SMTP_FROM || 'noreply@yurta.site',
    to: customer_email,
    subject: `Оплата сертификата не прошла (заказ ${order_id})`,
    html: `
      <h2>Оплата не прошла</h2>
      <p>К сожалению, оплата вашего сертификата не была завершена.</p>
      <p><strong>Номер заказа:</strong> ${order_id}</p>
      <p><strong>Сумма:</strong> ${amount} ₽</p>
      
      <h3>Возможные причины:</h3>
      <ul>
        <li>Недостаточно средств на карте</li>
        <li>Превышен лимит на операции в интернете</li>
        <li>Истек срок действия карты</li>
        <li>Вы закрыли страницу оплаты до завершения</li>
      </ul>
      
      <p>Вы можете попробовать оплатить снова, перейдя по ссылке:</p>
      <p><a href="${process.env.FRONTEND_URL}/certificates">Оформить сертификат</a></p>
      
      <p>Если проблема повторяется, попробуйте другую карту или обратитесь в поддержку:</p>
      <p>📞 +7 (3942) 20-00-00</p>
      <p>✉️ clinicaldan@mail.ru</p>
    `
  });
};
```

### 2. Вызывать при статусе 3, 4, 6 (отменен, возврат, отклонен)

```javascript
// В обработчике проверки статуса
if ([3, 4, 6].includes(orderStatus)) {
  await sendPaymentFailedEmail(orderData);
  // Логирование для админа
  console.log(`Payment failed for order ${order_id}, status ${orderStatus}`);
}
```

## Проблема 3: Перенаправление на новую страницу

**Маршруты:**
- `/payment-failed?orderId=xxx` - новая страница для неудачной оплаты
- `/certificates/success?orderId=xxx` - успешная оплата
- `/certificates/cancel?orderId=xxx` - отмененная оплата (теперь перенаправляет на `/payment-failed`)

**Где изменить:** В настройках Альфа-Банка (в ЛК) или в коде при создании платежа:

```javascript
// При создании платежа
const paymentData = {
  // ...
  returnUrl: `${frontendUrl}/certificates/success?orderId=${orderId}`,
  failUrl: `${frontendUrl}/payment-failed?orderId=${orderId}`, // Было /certificates/cancel
};
```

## Чек-лист изменений

- [ ] Найти файл создания сертификата (скорее всего `server/certificate.js` или类似)
- [ ] Добавить поле `is_active` или аналогичное
- [ ] Изменить логику: сертификат активен только после успешной оплаты
- [ ] Найти обработчик payment status callback
- [ ] Добавить отправку email при статусах 3, 4, 6
- [ ] Обновить `failUrl` на `/payment-failed`
- [ ] Протестировать на тестовой среде

## Переменные окружения для email

Убедитесь, что в `.env` или `.back.env` есть:

```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yurta.site
SMTP_PASS=пароль_приложения
SMTP_FROM=noreply@yurta.site
FRONTEND_URL=https://clinicaldan.ru
```
