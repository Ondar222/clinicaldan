# Certificate Admin API Contract

## Purpose

Admin endpoints for searching certificates and writing off a partial amount.

## Base path

- Production: `/api/certificate`
- Local (via proxy): `/api/certificate`

## 1) List/Search certificates

### Request

- Method: `GET`
- Path: `/admin/list`
- Query params:
  - `query` (optional, string) - certificate number or part of it
  - `page` (optional, number, default `1`)
  - `limit` (optional, number, default `20`, allowed range `1..20`)

### Response `200`

```json
{
  "data": [
    {
      "id": 123,
      "code": "CERT-2026-0001",
      "nominalAmount": 5000,
      "remainingAmount": 2000,
      "status": "partially_used",
      "createdAt": "2026-04-15T10:20:00.000Z",
      "expiresAt": "2026-07-15T10:20:00.000Z",
      "customerName": "Иван Иванов",
      "customerPhone": "+79230000000"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

Notes:
- Without query params, endpoint returns latest 20 certificates.
- If `limit > 20`, backend returns max 20.
- Optional: `includeFailed=true`, `includeUnsuccessful=true` — включать неуспешные попытки в выдачу (если поддерживается бэкендом).

## 2) Redeem (partial write-off)

### Request

- Method: `POST`
- Path: `/admin/redeem`
- Body:

```json
{
  "code": "CERT-2026-0001",
  "writeOffAmount": 3000,
  "reason": "Прием флеболога"
}
```

### Business rules

- Certificate must exist and be active.
- `writeOffAmount` must be greater than `0`.
- `writeOffAmount` must be less than or equal to `remainingAmount`.
- New value: `remainingAmount = remainingAmount - writeOffAmount`.
- Save operation to history/audit log (admin id, amount, date/time, reason, related service).

### Response `200`

```json
{
  "message": "Списание выполнено",
  "operationId": "op_18f2ad",
  "certificate": {
    "id": 123,
    "code": "CERT-2026-0001",
    "nominalAmount": 5000,
    "remainingAmount": 2000,
    "status": "partially_used"
  }
}
```

## 3) Certificate redeem history

### Request

- Method: `GET`
- Path: `/admin/history/:code`

Example: `/admin/history/CERT-2026-0001`

### Response `200`

```json
{
  "data": [
    {
      "id": "op_18f2ad",
      "certificateCode": "CERT-2026-0001",
      "writeOffAmount": 3000,
      "remainingAmountAfter": 2000,
      "reason": "Прием флеболога",
      "serviceName": "Консультация флеболога",
      "adminName": "Айкара",
      "createdAt": "2026-04-17T10:30:00.000Z"
    }
  ]
}
```

## 4) Список транзакций оплаты (для таблицы на `/staff`)

Фронт запрашивает по очереди (первый доступный ответ используется):

1. `GET /admin/transactions-list?limit=20`
2. `GET /admin/transactions?limit=20`

Если оба маршрута отсутствуют (`404`), фронт строит таблицу из полей `payment` в ответе `GET /admin/list`.

### Response `200`

```json
{
  "data": [
    {
      "id": "pay_1",
      "amount": 1000,
      "currency": "RUR",
      "orderId": "cc70011f-eea9-4096-bc48-52d1ac21f3a6",
      "paymentOrderId": "optional-bank-order-id",
      "bankStatus": 6,
      "bankStatusName": "(-2014) Клиент не вернулся с Платежной страницы",
      "paymentMethod": "Платежная карта | Card",
      "certificateCode": "CERT-2026-0042",
      "createdAt": "2026-04-17T17:32:59.000Z",
      "formUrl": "https://pay.alfabank.ru/..."
    }
  ]
}
```

Допустимые алиасы полей (фронт нормализует): `sum` / `orderAmount`, `mdOrder` / `orderNumber`, `orderStatus`, `actionCodeDescription`, `registeredAt` / `registered_at`.

## Error responses

- `400` invalid input (amount <= 0, amount > balance, invalid code)
- `404` certificate not found
- `409` optimistic lock / concurrent write-off
- `500` internal error

Suggested payload:

```json
{
  "message": "Сумма списания не может быть больше остатка сертификата"
}
```
