import type React from "react";
import { Link } from "react-router-dom";
import { SeoHead } from "./SeoHead";
import SchemaOrg from "./SchemaOrg";

export default function PriceListPage() {
  const seoData = {
    title: 'Прайс-лист на медицинские услуги клиники Алдан',
    description: 'Актуальные цены на все медицинские услуги клиники Алдан. Лабораторные исследования, УЗИ, консультации специалистов, диагностика и лечение. Прозрачное ценообразование.',
    canonical: '/prices',
    ogType: 'website' as const
  };

  return (
    <>
      <SeoHead pageData={seoData} />
      <SchemaOrg
        pageName="Прайс-лист клиники Алдан"
        pageDescription="Прайс-лист на медицинские услуги в разработке"
        pageUrl="https://clinicaldan.ru/prices"
        breadcrumbs={[
          { name: 'Главная', url: 'https://clinicaldan.ru/' },
          { name: 'Прайс-лист', url: 'https://clinicaldan.ru/prices' }
        ]}
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Иконка шестерёнки */}
            <div className="mb-8">
              <svg
                className="w-20 h-20 text-primary mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Прайс-лист в разработке
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Мы обновляем прайс-лист, чтобы предоставить вам актуальную информацию
              о стоимости всех медицинских услуг.
            </p>

            <p className="text-gray-500 mb-10">
              Чтобы узнать стоимость услуг, позвоните нам:
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+79233176060"
                className="px-8 py-3 bg-primary hover:bg-primaryDark text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                +7 (923) 317-60-60
              </a>
              <Link
                to="/directions"
                className="px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all"
              >
                Наши направления
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
