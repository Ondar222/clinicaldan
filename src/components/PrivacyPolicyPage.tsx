import type React from "react";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <article className="bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-12 space-y-6 md:space-y-8">
          <header>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Политика обработки персональных данных
            </h1>
            <p className="text-gray-500 text-sm">
              Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
            </p>
          </header>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              1. Общие положения
            </h2>
            <p>
              Настоящая Политика обработки персональных данных (далее —
              Политика) действует в отношении всех персональных данных, которые
              Общество с ограниченной ответственностью «АЛДАН» (далее —
              Оператор) может получить от посетителя сайта{" "}
              <a
                href="https://clinicaldan.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                clinicaldan.ru
              </a>
              .
            </p>
            <p>
              Оператор ставит своей важнейшей целью и условием осуществления
              своей деятельности соблюдение прав и свобод человека и гражданина
              при обработке его персональных данных, в том числе защиту прав на
              неприкосновенность частной жизни, личную и семейную тайну.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              2. Какие персональные данные мы собираем
            </h2>
            <p>
              В процессе использования сайта мы можем собирать следующие
              персональные данные:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Имя</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты (Email)</li>
              <li>Сообщения, отправленные через формы обратной связи</li>
              <li>Данные о записи на приём (желаемая дата и время)</li>
              <li>
                Файлы cookie и технические данные (IP-адрес, тип браузера,
                страница перехода)
              </li>
            </ul>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              3. Цели сбора персональных данных
            </h2>
            <p>Мы обрабатываем ваши персональные данные в следующих целях:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Обработка заявок и запросов пользователей</li>
              <li>Запись на приём к врачу</li>
              <li>
                Обратная связь с пользователем, включая направление уведомлений,
                запросов и информации, касающихся использования сайта, оказания
                услуг
              </li>
              <li>Улучшение качества сайта и пользовательского опыта</li>
              <li>
                Анализ посещаемости сайта с помощью файлов cookie и сервисов
                аналитики (Яндекс.Метрика)
              </li>
              <li>Исполнение обязательств перед пользователем</li>
            </ul>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              4. Правовые основания обработки
            </h2>
            <p>
              Оператор обрабатывает персональные данные Пользователя только в
              случае их заполнения и/или отправки Пользователем самостоятельно
              через специальные формы, расположенные на сайте. Заполняя
              соответствующие формы и/или отправляя свои персональные данные
              Оператору, Пользователь выражает своё согласие с данной Политикой.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              5. Порядок сбора, хранения и защиты данных
            </h2>
            <p>
              Оператор обеспечивает сохранность персональных данных и принимает
              все возможные меры, исключающие доступ к персональным данным
              неуполномоченных лиц.
            </p>
            <p>
              Персональные данные Пользователя не передаётся третьим лицам, за
              исключением случаев, связанных с исполнением действующего
              законодательства, либо в случае, если субъектом персональных
              данных дано согласие Оператору на передачу данных третьему лицу
              для исполнения обязательств по гражданско-правовому договору.
            </p>
            <p>
              Срок обработки персональных данных осуществляется в течение сроков
              действия соответствующих договоров, либо до момента отзыва
              согласия субъектом.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              6. Файлы cookie
            </h2>
            <p>
              Сайт может использовать файлы cookie для идентификации
              Пользователя, анализа посещаемости, персонализации контента.
              Подробнее о cookies — см.{" "}
              <a href="/cookie-policy" className="text-primary hover:underline">
                Политику использования файлов cookie
              </a>
              .
            </p>
            <p>
              Пользователь может настроить свой браузер таким образом, чтобы он
              не принимал cookie, однако в этом ряде функциональность сайта
              может быть ограничена.
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              7. Права пользователя
            </h2>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Получать информацию, касающуюся обработки его персональных
                данных
              </li>
              <li>
                Требовать уточнения, блокирования или уничтожения персональных
                данных
              </li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Обратиться с жалобой в Роскомнадзор</li>
            </ul>
            <p>
              Для реализации своих прав пользователь может направить запрос на
              адрес электронной почты:{" "}
              <a
                href="mailto:clinicaldan@mail.ru"
                className="text-primary hover:underline"
              >
                clinicaldan@mail.ru
              </a>
            </p>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              8. Контактная информация Оператора
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <p className="font-semibold">ООО «АЛДАН»</p>
              <p>ИНН: 1701049398</p>
              <p>
                Адрес: 667000, Республика Тыва, город Кызыл, ул. Ленина, д. 60,
                офис 1
              </p>
              <p>
                Телефон:{" "}
                <a
                  href="tel:+79233176060"
                  className="text-primary hover:underline"
                >
                  +7 (923) 317-60-60
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:clinicaldan@mail.ru"
                  className="text-primary hover:underline"
                >
                  clinicaldan@mail.ru
                </a>
              </p>
            </div>
          </section>

          <section className="space-y-4 text-gray-700 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              9. Заключительные положения
            </h2>
            <p>
              Пользователь может получить любые разъяснения по интересующим
              вопросам, касающимся обработки персональных данных, обратившись к
              Оператору с помощью электронной почты или по телефонным номерам,
              указанным в разделе «Контактная информация Оператора» выше.
            </p>
            <p>
              Настоящая Политика действует бессрочно до момента её замены новой
              редакцией, опубликованной на сайте.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
