import React from "react";
import { CLINIC_CONFIG, getMailLink, getTelLink } from "../data/clinicConfig";
import { SeoHead } from "./SeoHead";
// Временно скрыто - форма обратной связи
// import ContactForm from './ContactForm';

export default function ContactsPage() {
  const seoData = {
    title: "Контакты и адрес клиники Алдан в Кызыле",
    description: `Клиника Алдан: адрес ${CLINIC_CONFIG.address.street}, ${CLINIC_CONFIG.address.city}. Телефон: ${CLINIC_CONFIG.phoneFormatted}. Режим работы: Пн-Пт ${CLINIC_CONFIG.workingHours.weekdays}, Сб ${CLINIC_CONFIG.workingHours.saturday}.`,
    canonical: "/contacts",
    ogType: "website" as const,
  };

  return (
    <>
      <SeoHead pageData={seoData} />
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
              Контакты
            </h1>
            <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
              Адрес, телефоны, email и режим работы клиники Алдан в Кызыле
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">
          <div className="max-w-5xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10 flex flex-col h-full">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
                  Контактная информация
                </h2>
                <div className="space-y-5 flex-grow">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Адрес
                    </h3>
                    <p className="text-gray-600 leading-relaxed flex items-center gap-2">
                      <a
                        href="https://yandex.ru/maps/?text=667000%2C%20Республика%20Тыва%2C%20город%20Кызыл%2C%20Ленина%2C%2060"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primaryDark hover:underline transition-colors"
                        aria-label="Открыть адрес на карте"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 mr-1 flex-shrink-0"
                        >
                          <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
                        </svg>
                        {CLINIC_CONFIG.address.full}
                      </a>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Телефон
                    </h3>
                    <div className="text-gray-600 leading-relaxed space-y-1">
                      <p>
                        <a
                          href={getTelLink()}
                          className="text-lg font-semibold text-dark hover:text-primary transition-colors"
                          aria-label="Позвонить в клинику"
                        >
                          {CLINIC_CONFIG.phoneFormatted}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Email
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      <a
                        href={getMailLink()}
                        className="hover:text-primary transition-colors"
                      >
                        {CLINIC_CONFIG.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                      Режим работы
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Пн-Пт: {CLINIC_CONFIG.workingHours.weekdays}</p>
                      <p>Сб: {CLINIC_CONFIG.workingHours.saturday}</p>
                      <p>Вс: {CLINIC_CONFIG.workingHours.sunday}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8 border border-primary/10 flex flex-col h-full">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 bg-gradient-to-r from-dark to-primary bg-clip-text text-transparent">
                  Как добраться
                </h2>
                <div
                  className="flex-grow rounded-xl overflow-hidden border border-primary/10"
                  style={{ height: "400px" }}
                >
                  <iframe
                    src="https://yandex.ru/map-widget/v1/?um=constructor%3Ad2e4685aaf3109b93382144c62e33c664310acfba9a40f0943bec22ae4f9d8f5&amp;source=constructor&amp;z=17"
                    width="100%"
                    height="100%"
                    className="w-full h-full grayscale-[0.4] opacity-95 transition-all duration-300"
                    title="Карта расположения клиники"
                  />
                </div>
              </div>
            </div>

            {/* Временно скрыто - форма обратной связи
            <ContactForm />
            */}
          </div>
        </div>
      </div>
    </>
  );
}
