import type React from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface CookieNotificationProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieNotification: React.FC<CookieNotificationProps> = ({ onAccept, onDecline }) => {
  const { needsConsent, acceptCookies, declineCookies, isLoading } = useCookieConsent();

  const handleAccept = () => {
    acceptCookies();
    onAccept?.();
  };

  const handleDecline = () => {
    declineCookies();
    onDecline?.();
  };

  if (isLoading || !needsConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-lg pb-safe">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Использование файлов cookie
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента. 
              Продолжая использовать наш сайт, вы соглашаетесь с нашей политикой использования cookie-файлов.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
            >
              Отклонить
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap shadow-md"
            >
              Принять все cookie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieNotification;
