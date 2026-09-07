import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

export default function AboutClinicPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] overflow-hidden">
      {/* Мягкие декоративные пятна */}
      <div className="fixed -left-20 top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -right-10 bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg_8.avif)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            О клинике Алдан
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Современная медицинская клиника с высококвалифицированными специалистами. Мы предоставляем полный спектр медицинских услуг с использованием передовых технологий и индивидуальным подходом к каждому пациенту.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">

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
                    className="w-40 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-primary/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fdf2f4] to-white">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-primary/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#fdf2f4] to-white">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наша миссия
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Мы стремимся обеспечить доступную и качественную медицинскую
                помощь, используя современные методы диагностики и лечения. Наша
                цель - помочь каждому пациенту достичь оптимального здоровья и
                благополучия.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Преимущества клиники
              </h2>
              <ul className="space-y-4">
                {[
                  "Современное оборудование и технологии",
                  "Опытные врачи с высокой квалификацией",
                  "Индивидуальный подход к каждому пациенту",
                  "Удобное расположение и график работы",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
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
                    </div>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наши направления
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    title: "Диагностика",
                    desc: "Современные методы обследования",
                  },
                  { title: "Лечение", desc: "Эффективные методы терапии" },
                  { title: "Профилактика", desc: "Предупреждение заболеваний" },
                  { title: "Реабилитация", desc: "Восстановление здоровья" },
                ].map((dir, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-br from-[#fdf2f4] to-white rounded-lg border border-primary/10"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                      {dir.title}
                    </h3>
                    <p className="text-sm text-gray-600">{dir.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 md:mb-4 text-dark">
                Наши достижения
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { num: "15+", label: "Лет опыта" },
                  { num: "30+", label: "Специалистов" },
                  { num: "5000+", label: "Довольных пациентов" },
                  { num: "20+", label: "Медицинских направлений" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent mb-2">
                      {stat.num}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 md:mb-6 text-center text-dark">
            Контактная информация
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Адрес
              </h3>
              <a
                href="https://yandex.ru/maps/?text=%D0%B3.%20%D0%9A%D1%8B%D0%B7%D1%8B%D0%BB%2C%20%D1%83%D0%BB.%20%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B0%20%D0%B4.60"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary hover:underline inline-flex items-center transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-1 text-primary flex-shrink-0"
                >
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                </svg>
                г. Кызыл, ул. Ленина д.60
              </a>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Телефон
              </h3>
              <p className="text-gray-600">
                <a
                  href="tel:+79233176060"
                  className="hover:text-primary transition-colors"
                >
                  +7 (923) 317-60-60
                </a>
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
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
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-dark">
                Email
              </h3>
              <p className="text-gray-600">
                <a
                  href="mailto:clinicaldan@mail.ru"
                  className="hover:text-primary transition-colors"
                >
                  clinicaldan@mail.ru
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
