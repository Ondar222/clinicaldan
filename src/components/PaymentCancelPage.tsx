import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    // Перенаправляем на страницу PaymentFailedPage для лучшей обработки
    if (orderId) {
      navigate(`/payment-failed?orderId=${encodeURIComponent(orderId)}`, { replace: true });
    }
  }, [orderId, navigate]);

  // Fallback UI на случай если JS еще не загрузился
  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToCertificates = () => {
    navigate("/certificates");
  };

  const handleRetryPayment = () => {
    navigate("/certificates");
  };

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
          <h2 className="text-2xl font-bold text-dark mb-4">Платеж отменен</h2>
          <p className="text-gray-600 mb-6">
            Оплата сертификата была отменена. Если у вас возникли вопросы или
            проблемы с оплатой, пожалуйста, свяжитесь с нами.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Номер заказа: {orderId}
            </p>
          )}
          <div className="space-x-4">
            <button
              onClick={handleRetryPayment}
              className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={handleGoHome}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              На главную
            </button>
            <button
              onClick={handleGoToCertificates}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md font-medium transition-colors"
            >
              К сертификатам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
