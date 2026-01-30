import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import certificateService from "../services/certificates";

interface PaymentSuccessPageProps {
  type?: "certificate" | "appointment";
}

export default function PaymentSuccessPage({
  type = "certificate",
}: PaymentSuccessPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    paid: boolean;
    amount?: number;
    orderId?: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get("orderId");
  const receiptDate = new Date().toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setError("Номер заказа не найден");
        setIsLoading(false);
        return;
      }

      try {
        const response = await certificateService.checkPaymentStatus(orderId);
        
        // Статусы Альфа-Банка:
        // 0 - заказ зарегистрирован, но не оплачен
        // 1 - предавторизованная сумма захолдирована
        // 2 - проведена полная авторизация суммы заказа
        // 3 - авторизация отменена
        // 4 - по транзакции была проведена операция возврата
        // 5 - инициирована авторизация через ACS банка-эмитента
        // 6 - авторизация отклонена
        
        const isPaid = response.orderStatus === 2;
        const status = isPaid ? 'paid' : 'pending';
        
        setPaymentStatus({
          status,
          paid: isPaid,
          amount: response.amount,
          orderId: response.orderNumber
        });
      } catch (error) {
        console.error("Ошибка при проверке статуса платежа:", error);
        setError("Не удалось проверить статус платежа");
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToCertificates = () => {
    navigate("/certificates");
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        window.print();
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Чек — сертификат</title>
          <style>
            body { font-family: Arial,sans-serif; padding: 24px; max-width: 400px; margin: 0 auto; }
            h1 { font-size: 18px; margin-bottom: 16px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .divider { border-top: 1px dashed #000; margin: 16px 0; }
          </style>
          </head>
          <body>
            <h1>Клиника Алдан — Чек по сертификату</h1>
            <div class="divider"></div>
            <div class="row"><span>Номер заказа</span><strong>${paymentStatus?.orderId || orderId || "—"}</strong></div>
            <div class="row"><span>Сумма</span><strong>${paymentStatus?.amount != null ? `${paymentStatus.amount.toLocaleString("ru-RU")} ₽` : "—"}</strong></div>
            <div class="row"><span>Дата и время</span><span>${receiptDate}</span></div>
            <div class="row"><span>Статус</span><strong>${paymentStatus?.paid ? "Оплачено" : "В обработке"}</strong></div>
            <div class="divider"></div>
            <p style="font-size:12px;color:#666;">Сохраните номер заказа для предъявления в клинике.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем статус платежа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-dark mb-4">Платеж принят</h2>
            <p className="text-gray-600 mb-4">
              Не удалось автоматически проверить статус. Сохраните номер заказа — по нему можно проверить оплату в клинике.
            </p>
            <div ref={receiptRef} className="bg-gray-50 rounded-lg p-6 text-left mb-6 border border-gray-200">
              <h3 className="font-semibold text-dark mb-4">Чек / Подтверждение</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Номер заказа</span><strong>{orderId || "—"}</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Дата и время</span><span>{receiptDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Статус</span><span>Принято к обработке</span></div>
              </div>
            </div>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button type="button" onClick={handlePrintReceipt} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                Распечатать чек
              </button>
              <button onClick={handleGoHome} className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors">
                На главную
              </button>
              <button onClick={handleGoToCertificates} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                К сертификатам
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentStatus?.paid) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">Платеж в обработке</h2>
            <p className="text-gray-600 mb-6">
              Ваш платеж обрабатывается. Это может занять несколько минут. Сохраните чек по кнопке ниже.
            </p>
            <div ref={receiptRef} className="bg-gray-50 rounded-lg p-6 text-left mb-6 border border-gray-200">
              <h3 className="font-semibold text-dark mb-4">Чек по сертификату</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Номер заказа</span><strong>{paymentStatus?.orderId || orderId || "—"}</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Сумма</span><strong>{paymentStatus?.amount != null ? `${paymentStatus.amount.toLocaleString("ru-RU")} ₽` : "—"}</strong></div>
                <div className="flex justify-between"><span className="text-gray-600">Дата и время</span><span>{receiptDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Статус</span><span>В обработке</span></div>
              </div>
            </div>
            <div className="space-x-4">
              <button type="button" onClick={handlePrintReceipt} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                Распечатать чек
              </button>
              <button onClick={handleGoHome} className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors">
                На главную
              </button>
              <button onClick={handleGoToCertificates} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                К сертификатам
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark mb-4">
            {type === "certificate" ? "Сертификат успешно оплачен!" : "Запись успешно оплачена!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {type === "certificate"
              ? "Электронный сертификат отправлен на указанный email. Получатель сможет воспользоваться сертификатом в течение 3 месяцев."
              : "Ваша запись на прием подтверждена. Мы отправили подтверждение на ваш email."}
          </p>
          <div ref={receiptRef} className="bg-gray-50 rounded-lg p-6 text-left mb-6 border border-gray-200">
            <h3 className="font-semibold text-dark mb-4">Чек по сертификату</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Номер заказа</span><strong>{paymentStatus?.orderId || orderId || "—"}</strong></div>
              <div className="flex justify-between"><span className="text-gray-600">Сумма</span><strong>{paymentStatus?.amount != null ? `${paymentStatus.amount.toLocaleString("ru-RU")} ₽` : "—"}</strong></div>
              <div className="flex justify-between"><span className="text-gray-600">Дата и время</span><span>{receiptDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Статус</span><span className="text-green-600 font-medium">Оплачено</span></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Сохраните номер заказа для предъявления в клинике.</p>
          </div>
          <div className="space-x-4">
            <button type="button" onClick={handlePrintReceipt} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
              Распечатать чек
            </button>
            <button onClick={handleGoHome} className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors">
              На главную
            </button>
            {type === "certificate" && (
              <button onClick={handleGoToCertificates} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                Оформить еще один сертификат
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
