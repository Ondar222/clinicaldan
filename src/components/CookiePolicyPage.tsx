import type React from "react";
import CookieSettings from "./CookieSettings";

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Политика использования файлов cookie
          </h1>
          <p className="text-gray-600">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Что такое файлы cookie?
          </h2>
          <p className="text-gray-600 mb-4">
            Файлы cookie — это небольшие текстовые файлы, которые сохраняются на
            вашем устройстве при посещении веб-сайта. Они помогают сайту
            запомнить информацию о вашем посещении, что делает его более удобным
            для использования.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Как мы используем файлы cookie
          </h2>
          <p className="text-gray-600 mb-4">
            Файлы cookie используются в соответствии с нашей{" "}
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:underline font-medium"
            >
              Политикой обработки персональных данных
            </a>
            .
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Необходимые cookie
              </h3>
              <p className="text-gray-600">
                Эти файлы необходимы для работы сайта и не могут быть отключены.
                Они обычно устанавливаются в ответ на действия, которые вы
                выполняете, например, настройка параметров конфиденциальности,
                вход в систему или заполнение форм.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Аналитические cookie
              </h3>
              <p className="text-gray-600">
                Эти файлы позволяют нам подсчитывать посещения и источники
                трафика, чтобы мы могли измерять и улучшать производительность
                нашего сайта. Они помогают нам узнать, какие страницы наиболее и
                наименее популярны.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Маркетинговые cookie
              </h3>
              <p className="text-gray-600">
                Эти файлы могут быть установлены через наш сайт нашими
                рекламными партнерами для создания профиля ваших интересов и
                показа релевантной рекламы на других сайтах.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Управление файлами cookie
          </h2>
          <p className="text-gray-600 mb-4">
            Вы можете управлять файлами cookie через настройки вашего браузера
            или используя панель управления ниже.
          </p>
          <p className="text-gray-600">
            Обратите внимание, что отключение некоторых типов файлов cookie
            может повлиять на функциональность сайта.
          </p>
        </div>

        <CookieSettings />
      </div>
    </div>
  );
};

export default CookiePolicyPage;
