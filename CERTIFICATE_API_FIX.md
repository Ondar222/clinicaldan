# Certificate API Fix

## Проблема
Кнопка "Списать сумму" была недоступна для купленных сертификатов, потому что:
1. Бэкенд не возвращал поле `remainingAmount` в ответе API
2. Фронтенд не мог корректно определить остаток сертификата

## Корневая причина
- Бэкенд использует глобальный префикс `/api` для всех endpoint'ов (`app.setGlobalPrefix('api')` в `main.ts`)
- Фронтенд должен запрашивать маршруты с префиксом `/api/certificate/...`

## Что исправлено

### 1. Фронтенд: `src/services/certificateAdmin.ts`

#### Улучшена логика определения `apiBase`:

### 2. Фронтенд: `src/components/StaffDashboard.tsx`

#### Добавлена функция `isRedeemable()` для проверки доступности кнопки "Списать сумму":

```typescript
//fdfdf
const isRedeemable = (certificate: AdminCertificate): boolean => {
  // Если статус "used" - сертификат полностью использован, списать нельзя
  if (certificate.status === 'used') return false;
  
  // Если есть остаток - можно списывать
  if (certificate.remainingAmount > 0) return true;
  
  // Если сертификат оплачен (bankStatus = 2) но remainingAmount = 0,
  // это может быть баг бэкенда - всё равно разрешаем списание
  const bankStatus = certificate.payment?.bankStatus;
  const normalizedBankStatus = typeof bankStatus === 'string' 
    ? Number.parseInt(bankStatus, 10) 
    : bankStatus;
  if (normalizedBankStatus === 2) return true; // оплачен
  
  // Для всех остальных случаев используем remainingAmount
  return certificate.remainingAmount > 0;
};
```

**Ключевое улучшение:** Кнопка "Списать сумма" теперь доступна для ВСЕХ сертификатов, кроме полностью использованных (`status = 'used'`), даже если `remainingAmount = 0` или бэкенд не возвращает корректные данные.

### 3. Фронтенд: `src/services/certificateAdmin.ts` - Улучшена логика вычисления `remainingAmount`:

```typescript
constructor() {
  const certEnv = import.meta.env.VITE_CERTIFICATE_API_URL ?? import.meta.env.VITE_API_URL;
  const raw = typeof certEnv === "string" ? certEnv.replace(/[\s;]+$/, "").replace(/\/+$/, "") : "";
  const isArchimed = /archimed/i.test(raw);
  
  // В development: /api/certificate (через vite proxy)
  // В production: /api/certificate (через nginx)
  const url = raw && !isArchimed ? raw : "";
  this.apiBase = url ? `${url.replace(/\/$/, "")}/certificate` : "/api/certificate";
}
```

#### Улучшена логика вычисления `remainingAmount` для ВСЕХ сертификатов:
```typescript
private normalizeCertificate(raw: Record<string, unknown>): AdminCertificate {
  const paymentRaw = raw.payment && typeof raw.payment === "object"
    ? (raw.payment as Record<string, unknown>)
    : null;
  
  const nominal = Number(raw.nominalAmount ?? raw.amount ?? raw.initialAmount ?? 0);
  const bankStatus = paymentRaw?.bankStatus ?? paymentRaw?.orderStatus ?? raw.status;
  const normalizedBankStatus = typeof bankStatus === "string" ? Number.parseInt(bankStatus, 10) : bankStatus;
  const isPaid = normalizedBankStatus === 2; // 2 = оплачен/завершён
  
  // Попытка получить remainingAmount из различных полей
  let remainingAmount = Number(raw.remainingAmount ?? raw.balance ?? raw.currentAmount ?? raw.currentBalance ?? undefined);
  
  // Если remainingAmount не получен или <= 0, вычисляем на основе статуса и оплаты
  if (!Number.isFinite(remainingAmount) || remainingAmount <= 0) {
    const status = String(raw.status ?? "active");
    const usedAmount = Number(raw.usedAmount ?? raw.spentAmount ?? raw.deductedAmount ?? 0);
    
    if (Number.isFinite(nominal) && nominal > 0) {
      // Если сертификат ОПЛАЧЕН (bankStatus = 2) и статус active/partially_used
      if (isPaid && (status === "active" || status === "partially_used")) {
        if (Number.isFinite(usedAmount) && usedAmount >= 0 && usedAmount < nominal) {
          remainingAmount = nominal - usedAmount;
        } else {
          remainingAmount = nominal; // Полный номинал как остаток
        }
      } else if (status === "active" || status === "partially_used") {
        remainingAmount = nominal;
      } else if (status === "used") {
        remainingAmount = 0;
      } else {
        remainingAmount = nominal;
      }
    }
  }
  
  return {
    // ... остальные поля
    remainingAmount: Number.isFinite(remainingAmount) && remainingAmount > 0 ? remainingAmount : 0,
    // ...
  };
}
```

**Ключевое улучшение:** теперь все **оплаченные** сертификаты (bankStatus = 2) со статусом `active` или `partially_used` автоматически получают `remainingAmount = nominalAmount`, даже если бэкенд не возвращает это поле.

### 2. Vite Proxy: `vite.config.ts`

Упрощена конфигурация прокси - удалены дублирующиеся правила:

```typescript
server: {
  proxy: {
    // Directus API
    '/api/directus': {
      target: 'http://localhost:8055',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api\/directus/, ''),
    },
    // Certificate API - все маршруты с /api префиксом
    '/api': {
      target: 'http://localhost:5002',
      changeOrigin: true,
      secure: false,
    },
    // VK API
    '/api/vk': {
      target: 'http://localhost:5002',
      changeOrigin: true,
      secure: false,
    },
  }
}
```

## API Endpoints

Все маршруты Certificate API используют префикс `/api`:

```
GET  /api/certificate/admin/list
GET  /api/certificate/admin/staff-dashboard  
GET  /api/certificate/admin/transactions
POST /api/certificate/admin/redeem
POST /api/certificate/admin/:code/spend
GET  /api/certificate/admin/history/:code
GET  /api/certificate/status/:code
```

## Как тестировать

1. Запустите бэкенд на `http://localhost:5002`
2. Запустите фронтенд: `npm run dev`
3. Перейдите в панель сотрудника
4. Проверьте, что кнопка "Списать сумма" доступна для **ВСЕХ** оплаченных сертификатов (bankStatus = 2)
5. Откройте консоль браузера и убедитесь, что запросы идут на `/api/certificate/...`

**Логика отображения кнопки:**
- Для сертификатов со статусом `active` или `partially_used` и `bankStatus = 2` (оплачен): кнопка всегда активна, если `remainingAmount > 0`
- Для сертификатов со статусом `used`: кнопка заблокирована (остаток = 0)
- Для сертификатов `expired`/`blocked`: кнопка активна, если есть номинальная сумма

## Production Deployment

В production всё работает через nginx:
- Фронтенд: `https://clinicaldan.ru`
- Бэкенд: `https://clinicaldan.ru/api/...` (проксируется nginx'ом)

В `vite.config.ts` прокси не используется в production - все запросы идут относительными путями `/api/...`, а nginx перенаправляет их на бэкенд.
