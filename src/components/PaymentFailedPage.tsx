import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import certificateService from "../services/certificates";

export default function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<{
    status: string;
    paid: boolean;
    orderStatus?: number;
    amount?: number;
    orderId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const checkFailedPayment = async () => {
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
        // 2 - проведена полная авторизация суммы заказа (успех)
        // 3 - авторизация отменена
        // 4 - по транзакции была проведена операция возврата
        // 5 - инициирована авторизация через ACS банка-эмитента
        // 6 - авторизация отклонена (неудача)

        const isPaid = response.orderStatus === 2;
        const isFailed = [3, 4, 6].includes(response.orderStatus);

        setPaymentStatus({
          status: isFailed ? 'failed' : (isPaid ? 'paid' : 'pending'),
          paid: isPaid,
          orderStatus: response.orderStatus,
          amount: response.amount,
          orderId: response.orderNumber
        });
      } catch (err) {
        console.error("Ошибка при проверке статуса платежа:", err);
        // Если не удалось проверить, считаем что платеж неудачный
        setPaymentStatus({
          status: 'failed',
          paid: false,
          orderId: orderId || undefined
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkFailedPayment();
  }, [orderId]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToCertificates = () => {
    navigate("/certificates");
  };

  const handleRetryPayment = () => {
    // Можно передать orderId для повторной оплаты
    navigate("/certificates", { 
      state: { retryOrderId: orderId }
    });
  };

  const getFailureMessage = (orderStatus?: number) => {
    switch (orderStatus) {
      case 3:
        return "Платеж был отменен банком.";
      case 4:
        return "Был произведен возврат платежа.";
      case 6:
        return "Платеж отклонен банком-эмитентом карты.";
      default:
        return "Оплата не была завершена. Это могло произойти по нескольким причинам:";
    }
  };

  const getFailureReasons = (orderStatus?: number) => {
    if (orderStatus === 6) {
      return (
        <ul className="text-left space-y-2 mt-4">
          <li className="flex items-start">
            <span className="text-orange-500 mr-2">•</span>
            <span>Недостаточно средств на карте</span>
          </li>
          <li className="flex items-start">
            <span className="text-orange-500 mr-2">•</span>
            <span>Превышен лимит на операции в интернете</span>
          </li>
          <li className="flex items-start">
            <span className="text-orange-500 mr-2">•</span>
            <span>Карта не поддерживает онлайн-платежи</span>
          </li>
          <li className="flex items-start">
            <span className="text-orange-500 mr-2">•</span>
            <span>Истек срок действия карты</span>
          </li>
        </ul>
      );
    }

    return (
      <ul className="text-left space-y-2 mt-4">
        <li className="flex items-start">
          <span className="text-orange-500 mr-2">•</span>
          <span>Вы закрыли страницу оплаты до завершения</span>
        </li>
        <li className="flex items-start">
          <span className="text-orange-500 mr-2">•</span>
          <span>Истекло время ожидания платежа</span>
        </li>
        <li className="flex items-start">
          <span className="text-orange-500 mr-2">•</span>
          <span>Произошла техническая ошибка</span>
        </li>
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем статус платежа...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-orange-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">Платеж не прошел</h2>
            <p className="text-gray-600 mb-6">
              Не удалось проверить статус платежа. Пожалуйста, свяжитесь с нами для уточнения деталей.
            </p>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={handleGoToCertificates}
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Оформить сертификат
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если платеж оказался успешным (редкий случай)
  if (paymentStatus?.paid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-4">Платеж успешно завершен!</h2>
            <p className="text-gray-600 mb-6">
              Ваш сертификат оплачен и отправлен на указанный email.
            </p>
            <div className="space-x-4">
              <button onClick={handleGoHome} className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors">
                На главную
              </button>
              <button onClick={handleGoToCertificates} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors">
                Оформить еще один сертификат
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark mb-4">Оплата не прошла</h2>
          
          <p className="text-gray-700 mb-4 text-lg">
            {getFailureMessage(paymentStatus?.orderStatus)}
          </p>

          {paymentStatus?.orderStatus !== 6 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              {getFailureReasons(paymentStatus?.orderStatus)}
            </div>
          )}

          {paymentStatus?.orderStatus === 6 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-left text-sm text-gray-700 mb-2">
                <strong>Рекомендации:</strong>
              </p>
              {getFailureReasons(paymentStatus.orderStatus)}
              <p className="text-left text-sm text-gray-700 mt-4">
                Попробуйте использовать другую карту или обратитесь в ваш банк для уточнения причин отказа.
              </p>
            </div>
          )}

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Номер заказа:</strong> {orderId}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Сохраните номер заказа для обращения в службу поддержки
              </p>
            </div>
          )}

          <div className="space-x-4 mb-6">
            <button
              onClick={handleRetryPayment}
              className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={handleGoToCertificates}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              К сертификатам
            </button>
            <button
              onClick={handleGoHome}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              На главную
            </button>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">
              Нужна помощь? Свяжитесь с нами:
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📞 <a href="tel:+73942200000" className="text-primary hover:underline">+7 (3942) 20-00-00</a></p>
              <p>✉️ <a href="mailto:clinicaldan@mail.ru" className="text-primary hover:underline">clinicaldan@mail.ru</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
