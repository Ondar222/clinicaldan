import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".back.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Конфигурация Альфа-Банка
const ALFA_BANK_CONFIG = {
  // Тестовая среда
  test: {
    url: "https://alfa.rbsuat.com/payment/rest",
    token: "pfcr5js74l5jnsqcsrms960nok",
    login: "clinicaldan-operator",
    password: "KACr2LiW3R?",
  },
  // Продакшн среда
  production: {
    url: "https://pay.alfabank.ru/payment/rest",
    token: "pfcr5js74l5jnsqcsrms960nok",
    login: "clinicaldan-operator",
    password: "vy_$2BTVD*KVD#u/",
  },
};

// Соответствие наш orderNumber -> orderId Альфа-Банка (для проверки статуса после редиректа)
const orderIdByOrderNumber = new Map();
// Данные сертификата по orderNumber (для отправки письма после оплаты)
const certificateDataByOrderNumber = new Map();
// Заказы, по которым письмо уже отправлено (чтобы не дублировать)
const emailSentByOrderNumber = new Set();

// Определяем текущую среду
const isProduction = process.env.NODE_ENV === "production";
const currentConfig = isProduction
  ? ALFA_BANK_CONFIG.production
  : ALFA_BANK_CONFIG.test;

console.log(`🚀 Запуск в ${isProduction ? "ПРОДАКШН" : "ТЕСТОВОЙ"} среде`);
console.log(`🔗 URL Альфа-Банка: ${currentConfig.url}`);

// Транспорт для отправки писем (если заданы SMTP_* в .back.env)
const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.MAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
const smtpFrom = process.env.SMTP_FROM || process.env.MAIL_FROM || smtpUser || "noreply@clinicaldan.ru";

const mailTransport =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT) || 465,
        secure: String(process.env.SMTP_SECURE ?? process.env.MAIL_SECURE ?? "true").toLowerCase() === "true",
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

if (!mailTransport) {
  console.warn("⚠️ SMTP не настроен (SMTP_HOST, SMTP_USER, SMTP_PASS в .back.env) — письма с сертификатом не отправляются.");
}

function buildCertificateEmailHtml(orderNumber, amount, greetingText, customer, sponsor) {
  const recipientName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Получатель";
  const senderLine = sponsor
    ? `От: ${[sponsor.firstName, sponsor.lastName].filter(Boolean).join(" ") || "Даритель"}`
    : "";
  const greetingBlock = greetingText
    ? `<div style="margin:16px 0;padding:12px;background:#f8f9fa;border-radius:8px;font-size:15px;">${greetingText.replace(/\n/g, "<br>")}</div>`
    : "";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Подарочный сертификат</title></head>
<body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#333;">
  <h2 style="color:#d2002e;">Подарочный сертификат — Клиника Алдан</h2>
  <p>Здравствуйте, ${recipientName}!</p>
  ${greetingBlock}
  <p>Вам оформлен подарочный сертификат на услуги нашей клиники.</p>
  <div style="margin:20px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
    <p style="margin:0 0 8px;"><strong>Номер сертификата:</strong> ${orderNumber}</p>
    <p style="margin:0 0 8px;"><strong>Номинал:</strong> ${Number(amount).toLocaleString("ru-RU")} ₽</p>
    <p style="margin:0;"><strong>Срок действия:</strong> 3 месяца с даты оплаты.</p>
  </div>
  ${senderLine ? `<p style="color:#6b7280;font-size:14px;">${senderLine}</p>` : ""}
  <p>Предъявите номер сертификата в клинике при записи или визите.</p>
  <p style="color:#6b7280;font-size:13px;">С уважением,<br>Клиника Алдан</p>
</body>
</html>`;
}

async function sendCertificateEmail(orderNumber, data) {
  if (!mailTransport || !data.customer?.email) return;
  const { customer, sponsor, greetingText, amount } = data;
  const html = buildCertificateEmailHtml(orderNumber, amount, greetingText, customer, sponsor);
  try {
    await mailTransport.sendMail({
      from: smtpFrom,
      to: customer.email,
      subject: "Подарочный сертификат — Клиника Алдан",
      html,
      text: `Подарочный сертификат Клиника Алдан. Номер: ${orderNumber}. Сумма: ${amount} ₽. Срок: 3 месяца.`,
    });
    console.log(`[email] Сертификат отправлен на ${customer.email}, orderNumber=${orderNumber}`);
  } catch (err) {
    console.error(`[email] Ошибка отправки сертификата на ${customer.email}:`, err.message);
  }
}

// Прокси для создания платежа
app.post("/api/payment/register", async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`[${requestId}] === НАЧАЛО СОЗДАНИЯ ПЛАТЕЖА ===`);

  try {
    const { amount, returnUrl, failUrl, description } = req.body;

    console.log(`[${requestId}] Получен запрос на создание платежа:`, {
      amount,
      returnUrl,
      failUrl,
      description,
    });

    // Валидация входных данных
    if (!amount || !returnUrl || !failUrl || !description) {
      console.error(`[${requestId}] ❌ Отсутствуют обязательные параметры:`, {
        amount,
        returnUrl,
        failUrl,
        description,
      });
      return res.status(400).json({
        error: true,
        errorCode: "MISSING_PARAMETERS",
        message: "Отсутствуют обязательные параметры",
      });
    }

    // Дополнительная валидация
    if (amount < 100) {
      console.error(`[${requestId}] ❌ Сумма слишком мала: ${amount}`);
      return res.status(400).json({
        error: true,
        errorCode: "INVALID_AMOUNT",
        message: "Минимальная сумма платежа 100 рублей",
      });
    }

    if (amount > 100000) {
      console.error(`[${requestId}] ❌ Сумма слишком велика: ${amount}`);
      return res.status(400).json({
        error: true,
        errorCode: "INVALID_AMOUNT",
        message: "Максимальная сумма платежа 100 000 рублей",
      });
    }

    // Генерация orderNumber
    const orderNumber = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`[${requestId}] Сгенерирован номер заказа: ${orderNumber}`);

    const requestData = {
      orderNumber: orderNumber,
      amount: (amount * 100).toString(), // Конвертация в копейки
      returnUrl: returnUrl,
      failUrl: failUrl,
      description: description,
      token: currentConfig.token,
    };

    console.log(`[${requestId}] Отправка запроса к Альфа-Банку:`, {
      orderNumber: requestData.orderNumber,
      amount: requestData.amount,
      returnUrl: requestData.returnUrl,
      failUrl: requestData.failUrl,
      description: requestData.description,
      token: "***", // Скрываем токен в логах
    });

    const response = await fetch(`${currentConfig.url}/register.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(requestData).toString(),
    });

    console.log(
      `[${requestId}] Статус ответа от Альфа-Банка: ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[${requestId}] ❌ HTTP ошибка от Альфа-Банка:`,
        response.status,
        errorText
      );
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    console.log(`[${requestId}] Ответ от Альфа-Банка:`, result);

    if (result.errorCode) {
      console.error(`[${requestId}] ❌ Ошибка Альфа-Банка:`, {
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        orderNumber: orderNumber,
      });
      return res.status(400).json({
        error: true,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage || "Ошибка при создании платежа",
        orderNumber: orderNumber,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Платеж успешно создан:`, {
      orderId: result.orderId,
      orderNumber: orderNumber,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      formUrl: result.formUrl,
      orderId: result.orderId,
      orderNumber: orderNumber,
      duration: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Ошибка при создании платежа:`, {
      error: error.message,
      duration: `${duration}ms`,
    });
    res.status(500).json({
      error: true,
      errorCode: "INTERNAL_ERROR",
      message: "Внутренняя ошибка сервера",
      details: error.message,
      duration: duration,
    });
  }
});

// Прокси для проверки статуса заказа
app.post("/api/payment/status", async (req, res) => {
  const startTime = Date.now();
  const requestId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  console.log(`[${requestId}] === НАЧАЛО ПРОВЕРКИ СТАТУСА ===`);

  try {
    const { orderId } = req.body;

    console.log(`[${requestId}] Получен запрос на проверку статуса:`, {
      orderId,
    });

    if (!orderId) {
      console.error(`[${requestId}] ❌ Отсутствует orderId`);
      return res.status(400).json({
        error: true,
        errorCode: "MISSING_ORDER_ID",
        message: "orderId обязателен",
      });
    }

    const requestData = {
      orderId: orderId,
      token: currentConfig.token,
    };

    console.log(`[${requestId}] Проверка статуса заказа:`, {
      orderId: requestData.orderId,
      token: "***", // Скрываем токен в логах
    });

    const response = await fetch(`${currentConfig.url}/getOrderStatus.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(requestData).toString(),
    });

    console.log(
      `[${requestId}] Статус ответа от Альфа-Банка: ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[${requestId}] ❌ HTTP ошибка от Альфа-Банка:`,
        response.status,
        errorText
      );
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const result = await response.json();
    console.log(`[${requestId}] Статус заказа от Альфа-Банка:`, result);

    if (result.errorCode) {
      console.error(
        `[${requestId}] ❌ Ошибка Альфа-Банка при проверке статуса:`,
        {
          errorCode: result.errorCode,
          errorMessage: result.errorMessage,
          orderId: orderId,
        }
      );
      return res.status(400).json({
        error: true,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage || "Ошибка при проверке статуса",
        orderId: orderId,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Статус заказа успешно получен:`, {
      orderId: orderId,
      orderStatus: result.orderStatus,
      orderNumber: result.orderNumber,
      amount: result.amount,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      ...result,
      duration: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Ошибка при проверке статуса:`, {
      error: error.message,
      orderId: req.body.orderId,
      duration: `${duration}ms`,
    });
    res.status(500).json({
      error: true,
      errorCode: "INTERNAL_ERROR",
      message: "Внутренняя ошибка сервера",
      details: error.message,
      duration: duration,
    });
  }
});

// Создание сертификата и получение ссылки на оплату (для страницы «Сертификаты»)
app.post("/certificate", async (req, res) => {
  const requestId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const startTime = Date.now();

  try {
    if (!req.body || typeof req.body !== "object") {
      console.error(`[${requestId}] Некорректное тело запроса:`, req.body);
      return res.status(400).json({
        message: "Отправьте данные в формате JSON (Content-Type: application/json)",
        errorCode: "INVALID_BODY",
      });
    }

    const { amount, customer, sponsor, greetingText } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({
        message: "Минимальная сумма сертификата 100 ₽",
        errorCode: "INVALID_AMOUNT",
      });
    }
    if (amount > 100000) {
      return res.status(400).json({
        message: "Максимальная сумма сертификата 100 000 ₽",
        errorCode: "INVALID_AMOUNT",
      });
    }
    if (!customer?.email) {
      return res.status(400).json({
        message: "Укажите email получателя",
        errorCode: "MISSING_CUSTOMER",
      });
    }

    const orderNumber = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const origin = req.get("origin") || req.get("referer")?.replace(/\/$/, "") || "http://localhost:5173";
    // Редирект на статическую страницу, чтобы не ломаться из‑за кэша index.html и 404 на /assets/index-*.js
    const returnUrl = `${origin}/certificates-success.html?orderId=${orderNumber}`;
    const failUrl = `${origin}/certificates-cancel.html?orderId=${orderNumber}`;
    const description = `Подарочный сертификат Клиника Алдан — ${amount} ₽`;

    const requestData = {
      orderNumber,
      amount: String(amount * 100),
      returnUrl,
      failUrl,
      description,
      token: currentConfig.token,
    };

    const response = await fetch(`${currentConfig.url}/register.do`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(requestData).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Альфа-Банк HTTP error:`, response.status, errorText);
      return res.status(502).json({
        message: "Ошибка платёжного сервиса. Попробуйте позже.",
        errorCode: "PAYMENT_SERVICE_ERROR",
      });
    }

    const result = await response.json().catch(() => ({}));
    if (result.errorCode) {
      console.error(`[${requestId}] Альфа-Банк error:`, result);
      return res.status(400).json({
        message: result.errorMessage || "Ошибка при создании платежа",
        errorCode: result.errorCode,
      });
    }
    if (!result.formUrl || !result.orderId) {
      console.error(`[${requestId}] Альфа-Банк: нет formUrl/orderId в ответе:`, result);
      return res.status(502).json({
        message: "Ошибка платёжного сервиса. Попробуйте позже.",
        errorCode: "PAYMENT_SERVICE_ERROR",
      });
    }

    orderIdByOrderNumber.set(orderNumber, result.orderId);
    certificateDataByOrderNumber.set(orderNumber, {
      customer: customer || {},
      sponsor: sponsor || null,
      greetingText: greetingText || "",
      amount: Number(amount),
    });

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Сертификат создан: orderNumber=${orderNumber}, duration=${duration}ms`);

    res.json({
      message: "Сертификат создан",
      code: orderNumber,
      paymentUrl: result.formUrl,
      orderId: result.orderId,
    });
  } catch (error) {
    console.error(`[${requestId}] Ошибка /certificate:`, error.message);
    console.error(`[${requestId}] Stack:`, error.stack);
    res.status(500).json({
      message: "Внутренняя ошибка сервера. Попробуйте еще раз.",
      errorCode: "INTERNAL_ERROR",
    });
  }
});

// Проверка статуса оплаты сертификата (для страницы успеха; в URL приходит наш orderNumber)
app.post("/certificate/check-payment/:orderNumber", async (req, res) => {
  const orderNumber = req.params.orderNumber;
  const requestId = `check_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    if (!orderNumber) {
      return res.status(400).json({
        orderStatus: 0,
        orderNumber: "",
        amount: 0,
        errorCode: "MISSING_ORDER_ID",
      });
    }

    const orderId = orderIdByOrderNumber.get(orderNumber) || orderNumber;

    const requestData = {
      orderId: orderId,
      token: currentConfig.token,
    };

    const response = await fetch(`${currentConfig.url}/getOrderStatus.do`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(requestData).toString(),
    });

    if (!response.ok) {
      return res.status(502).json({
        orderStatus: 0,
        orderNumber: orderId,
        amount: 0,
        errorCode: "SERVICE_ERROR",
      });
    }

    const result = await response.json();
    if (result.errorCode) {
      return res.status(400).json({
        orderStatus: 0,
        orderNumber: orderNumber,
        amount: 0,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });
    }

    // При успешной оплате (orderStatus === 2) отправляем письмо с сертификатом один раз
    if (result.orderStatus === 2 && !emailSentByOrderNumber.has(orderNumber)) {
      const certData = certificateDataByOrderNumber.get(orderNumber);
      if (certData?.customer?.email) {
        emailSentByOrderNumber.add(orderNumber);
        const amountRub = result.amount != null ? Math.round(Number(result.amount) / 100) : certData.amount;
        sendCertificateEmail(orderNumber, { ...certData, amount: amountRub }).catch(() => {});
      }
    }

    res.json({
      orderStatus: result.orderStatus,
      orderNumber: result.orderNumber || orderNumber,
      amount: result.amount != null ? Math.round(Number(result.amount) / 100) : 0,
    });
  } catch (error) {
    console.error(`[${requestId}] Ошибка check-payment:`, error.message);
    res.status(500).json({
      orderStatus: 0,
      orderNumber: orderNumber,
      amount: 0,
      errorCode: "INTERNAL_ERROR",
    });
  }
});

// Редиректы на статические страницы успеха/отмены (чтобы после банка всегда открывался чек, а не пустой SPA)
app.get("/certificates/success", (req, res) => {
  const query = req.url && req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(302, "/certificates-success.html" + query);
});
app.get("/certificates/cancel", (req, res) => {
  const query = req.url && req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(302, "/certificates-cancel.html" + query);
});

// Статические файлы для продакшена
app.use(express.static(path.join(__dirname, "dist")));

// Fallback для SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступен по адресу: http://localhost:${PORT}/api`);
});
