import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

export default function AboutClinicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-dark">
            О клинике Алдан
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            Современная медицинская клиника с высококвалифицированными
            специалистами. Мы предоставляем полный спектр медицинских услуг с
            использованием передовых технологий и индивидуальным подходом к
            каждому пациенту.
          </p>
        </div>

        {/* Our Tools Block - Last 5 Tools */}
        <div className="mb-12 md:mb-16">
          <div className="relative mb-8">
            {/* Decorative Elements */}
            <div className="absolute -left-4 top-0 w-12 h-12 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -right-4 bottom-0 w-16 h-16 bg-primary/5 rounded-full blur-xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-8 bg-primary rounded-full" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
                    Современное оборудование
                  </h2>
                </div>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
                  В нашей клинике используется{" "}
                  <span className="font-medium text-dark">
                    передовое медицинское оборудование
                  </span>{" "}
                  для точной диагностики и эффективного лечения
                </p>
              </div>
              <Link
                to="/tools"
                className="inline-flex items-center justify-center sm:justify-end text-primary hover:text-primaryDark font-medium text-sm group flex-shrink-0 transition-colors"
              >
                <span className="border-b border-primary/30 group-hover:border-primary transition-colors pb-0.5">
                  Все инструменты
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Tools Grid - Horizontal scroll on mobile, grid on desktop */}
          <div className="mb-8">
            {/* Mobile: Horizontal scroll */}
            <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {tools.slice(-5).map((tool, index) => (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.id}`}
                    className="w-40 flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-dark mb-1 line-clamp-2 min-h-[2.5rem]">
                        {tool.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden sm:grid grid-cols-5 gap-4 mb-8">
              {tools.slice(-5).map((tool, index) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-dark mb-1 line-clamp-2 min-h-[2.5rem]">
                      {tool.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наша миссия
              </h2>
              <p className="text-gray-600">
                Мы стремимся обеспечить доступную и качественную медицинскую
                помощь, используя современные методы диагностики и лечения. Наша
                цель - помочь каждому пациенту достичь оптимального здоровья и
                благополучия.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Преимущества клиники
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Современное оборудование и технологии
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Опытные врачи с высокой квалификацией
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Индивидуальный подход к каждому пациенту
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-2 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Удобное расположение и график работы
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наши направления
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                    Диагностика
                  </h3>
                  <p className="text-sm text-gray-600">
                    Современные методы обследования
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                    Лечение
                  </h3>
                  <p className="text-sm text-gray-600">
                    Эффективные методы терапии
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                    Профилактика
                  </h3>
                  <p className="text-sm text-gray-600">
                    Предупреждение заболеваний
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                    Реабилитация
                  </h3>
                  <p className="text-sm text-gray-600">
                    Восстановление здоровья
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наши достижения
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    15+
                  </div>
                  <div className="text-gray-600">Лет опыта</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    30+
                  </div>
                  <div className="text-gray-600">Специалистов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    5000+
                  </div>
                  <div className="text-gray-600">Довольных пациентов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    20+
                  </div>
                  <div className="text-gray-600">Медицинских направлений</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6 text-center text-dark">
            Контактная информация
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <svg
                className="w-8 h-8 text-primary mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Адрес
              </h3>
              <a
                href="https://yandex.ru/maps/?text=%D0%B3.%20%D0%9A%D1%8B%D0%B7%D1%8B%D0%BB%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%20%D0%B4.60"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:underline inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-1 text-primary"
                >
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
                г. Кызыл, ул. Ленина д.60
              </a>
            </div>
            <div className="text-center">
              <svg
                className="w-8 h-8 text-primary mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Телефон
              </h3>
              <p className="text-gray-600">+7 (923) 317-60-60</p>
            </div>
            <div className="text-center">
              <svg
                className="w-8 h-8 text-primary mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Email
              </h3>
              <p className="text-gray-600">clinicaldan@mail.ru</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
