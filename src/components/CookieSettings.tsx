import type React from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookieSettings: React.FC = () => {
  const { 
    consentStatus, 
    hasConsent, 
    hasDeclined, 
    acceptCookies, 
    declineCookies, 
    resetConsent 
  } = useCookieConsent();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Настройки файлов cookie
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента. 
          Вы можете управлять своими предпочтениями ниже.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Текущий статус:</h3>
          <p className="text-blue-800 flex items-center gap-2">
            {consentStatus === 'accepted' && (
              <>
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Вы приняли использование cookie-файлов
              </>
            )}
            {consentStatus === 'declined' && (
              <>
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Вы отклонили использование cookie-файлов
              </>
            )}
            {!consentStatus && (
              <>
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
                Статус не определен
              </>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
          <div>
            <h3 className="font-semibold text-gray-900">Необходимые cookie</h3>
            <p className="text-sm text-gray-600">
              Эти файлы необходимы для базовой работы сайта и не могут быть отключены.
            </p>
          </div>
          <div className="text-green-600 font-semibold">Всегда активны</div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
          <div>
            <h3 className="font-semibold text-gray-900">Аналитические cookie</h3>
            <p className="text-sm text-gray-600">
              Помогают нам понять, как посетители взаимодействуют с сайтом.
            </p>
          </div>
          <div className={`font-semibold ${hasConsent ? 'text-green-600' : 'text-gray-400'}`}>
            {hasConsent ? 'Активны' : 'Неактивны'}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
          <div>
            <h3 className="font-semibold text-gray-900">Маркетинговые cookie</h3>
            <p className="text-sm text-gray-600">
              Используются для показа релевантной рекламы и отслеживания эффективности кампаний.
            </p>
          </div>
          <div className={`font-semibold ${hasConsent ? 'text-green-600' : 'text-gray-400'}`}>
            {hasConsent ? 'Активны' : 'Неактивны'}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {!hasConsent && (
          <button
            onClick={acceptCookies}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Принять все cookie
          </button>
        )}
        
        {hasConsent && (
          <button
            onClick={declineCookies}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Отклонить необязательные cookie
          </button>
        )}
        
        <button
          onClick={resetConsent}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Сбросить настройки
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>
          Более подробную информацию о том, как мы используем cookie-файлы, 
          вы можете найти в нашей{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Политике конфиденциальности
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default CookieSettings;
