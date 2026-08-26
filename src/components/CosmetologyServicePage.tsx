/**
 * Страница конкретной услуги косметологии
 * Полный набор блоков согласно ТЗ
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SeoHead } from './SeoHead';
import SchemaOrg from './SchemaOrg';
import { 
  COSMETOLOGY_CATEGORIES, 
  getCategoryBySlug,
  isExcludedCosmetologyDoctor,
  type CosmetologyCategory,
  type FAQItem
} from '../data/cosmetology';
import { CLINIC_CONFIG, getTelLink } from '../data/clinicConfig';
import type { ArchimedDoctor, ApiService } from '../types/cms';
import archimedService from '../services/archimed';

interface CosmetologyServicePageProps {
  categorySlug?: string;
}

export default function CosmetologyServicePage({ categorySlug }: CosmetologyServicePageProps) {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  
  // Состояния
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [allServices, setAllServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [doctorsData, servicesData] = await Promise.all([
          archimedService.getDoctors(),
          archimedService.getServices()
        ]);
        
        const cosmetologists = (doctorsData || []).filter(d => {
          const type = (d.type || '').toLowerCase();
          return (type.includes('космет') || type.includes('дерматовенеролог')) && !isExcludedCosmetologyDoctor(d);
        });
        setDoctors(cosmetologists);
        setAllServices(servicesData || []);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Находим категорию
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;
  
  // Находим услугу по slug (ищем по названию или коду)
  const service = useMemo(() => {
    if (!serviceSlug) return null;
    const slugLower = serviceSlug.toLowerCase().replace(/-/g, ' ');
    return allServices.find(s => {
      const nameLower = (s.name || '').toLowerCase();
      const altLower = (s.altname || '').toLowerCase();
      return nameLower.includes(slugLower) || altLower.includes(slugLower) || 
             s.name.toLowerCase().replace(/[^а-яa-z0-9]/g, '-').includes(serviceSlug);
    });
  }, [allServices, serviceSlug]);
  
  // Если услуга не найдена - показываем 404 или список
  if (!isLoading && !service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Услуга не найдена</h1>
          <p className="text-gray-600 mb-6">Услуга "{serviceSlug}" не найдена в разделе косметологии.</p>
          <Link 
            to="/services/cosmetology" 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
          >
            Вернуться к списку услуг
          </Link>
        </div>
      </div>
    );
  }
  
  // Получаем связанного врача
  const serviceDoctor = useMemo(() => {
    if (!service || doctors.length === 0) return null;
    // Простая логика - берем первого косметолога
    return doctors[0];
  }, [service, doctors]);
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    if (price === 0) return 'Цена уточняется';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };
  
  // SEO данные
  const pageTitle = service 
    ? `${service.name} в Алдане — Клиника Алдан`
    : 'Услуга косметологии — Клиника Алдан';
  const pageDescription = service
    ? `${service.name} в Клинике Алдан. ${service.info || ''} Запись по телефону ${CLINIC_CONFIG.phoneFormatted}.`
    : 'Косметологические услуги в Клинике Алдан в Алдане.';
  
  const seoData = {
    title: pageTitle,
    description: pageDescription,
    canonical: `/services/cosmetology/${categorySlug}/${serviceSlug}`,
    ogType: 'website' as const
  };
  
  // Хлебные крошки
  const breadcrumbs = [
    { name: 'Главная', url: 'https://clinicaldan.ru/' },
    { name: 'Услуги', url: '/services' },
    { name: 'Косметология', url: '/services/cosmetology' }
  ];
  if (category) {
    breadcrumbs.push({ name: category.name, url: `/services/cosmetology/${category.slug}` });
  }
  if (service) {
    breadcrumbs.push({ name: service.name, url: '#' });
  }
  
  // Показания для примера (в реальном проекте - из API/CMS)
  const sampleIndications = [
    'Возрастные изменения кожи',
    'Снижение упругости и эластичности',
    'Мелкие морщины',
    'Тусклый цвет лица',
    'Сухость кожи'
  ];
  
  // Противопоказания
  const sampleContraindications = [
    'Беременность и период грудного вскармливания',
    'Острые воспалительные процессы в зоне воздействия',
    'Онкологические заболевания',
    'Сахарный диабет в стадии декомпенсации',
    'Нарушения свертываемости крови',
    'Индивидуальная непереносимость препаратов'
  ];
  
  // Подготовка
  const samplePreparation = [
    'За 2 недели до процедуры прекратить прием антикоагулянтов',
    'За неделю избегать агрессивных косметологических процедур',
    'За 3 дня не употреблять алкоголь',
    'В день процедуры не наносить декоративную косметику',
    'Сообщить врачу о принимаемых лекарствах'
  ];
  
  // Рекомендации после процедуры
  const sampleAftercare = [
    'Избегать прямых солнечных лучей 2-4 недели',
    'Не посещать сауну и бассейн 3-5 дней',
    'Не наносить декоративную косметику в день процедуры',
    'Использовать увлажняющие средства по рекомендации врача',
    'Соблюдать питьевой режим',
    'Прийти на повторный прием по назначению врача'
  ];
  
  // FAQ для услуги
  const serviceFAQ: FAQItem[] = [
    {
      question: 'Как долго длится эффект от процедуры?',
      answer: 'Эффект зависит от типа процедуры и индивидуальных особенностей. В среднем результат сохраняется от 6 месяцев до 2 лет. Для поддержания эффекта рекомендуются поддерживающие процедуры.'
    },
    {
      question: 'Болезненна ли процедура?',
      answer: 'Уровень дискомфорта зависит от процедуры. Большинство косметологических процедур проводятся с использованием анестезии или минимально неприятны. Врач обязательно обсудит с вами этот вопрос на консультации.'
    },
    {
      question: 'Сколько процедур нужно для видимого результата?',
      answer: 'Количество процедур индивидуально и зависит от состояния кожи и выбранной методики. Часто достаточно 1-3 процедур, но для некоторых методик может потребоваться курс из 5-10 сеансов.'
    },
    {
      question: 'Есть ли реабилитационный период?',
      answer: 'Большинство современных косметологических процедур не требуют длительной реабилитации. Возможны небольшие покраснения или отеки, которые проходят в течение нескольких дней.'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <SeoHead pageData={seoData} />
      
      <SchemaOrg
        pageName={service?.name || 'Услуга косметологии'}
        pageDescription={pageDescription}
        pageUrl={`https://clinicaldan.ru/services/cosmetology/${categorySlug}/${serviceSlug}`}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Хлебные крошки */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-primary">Главная</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-primary">Услуги</Link>
              <span>/</span>
              <Link to="/services/cosmetology" className="hover:text-primary">Косметология</Link>
              {category && (
                <>
                  <span>/</span>
                  <Link to={`/services/cosmetology/${category.slug}`} className="hover:text-primary">
                    {category.name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-dark font-medium">{service?.name}</span>
            </nav>
          </div>
        </div>
        
        {/* Блок 1: Первый экран */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark mb-4">
              {service?.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Link
                to="/prices"
                className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Смотреть цены
              </Link>
            </div>
            
            {/* Цена и длительность */}
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="text-sm text-gray-500 block mb-1">Стоимость</span>
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  {formatPrice(service?.base_cost || 0)}
                </span>
              </div>
              {service && service.duration > 0 && (
                <div>
                  <span className="text-sm text-gray-500 block mb-1">Длительность</span>
                  <span className="text-xl font-semibold text-dark">
                    {service.duration} минут
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Блок 2: Описание услуги */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-dark mb-4">Что это за процедура</h2>
            <div className="prose max-w-none text-gray-700">
              {service?.info ? (
                <p>{service.info}</p>
              ) : (
                <p>
                  Современная косметологическая процедура, направленная на улучшение состояния кожи 
                  и решение эстетических проблем. Проводится сертифицированными специалистами 
                  с использованием современного оборудования и препаратов.
                </p>
              )}
            </div>
          </div>
        </section>
        
        {/* Блок 3: Какие проблемы решает */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-dark mb-4">Какие проблемы решает</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleIndications.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 4: Показания и противопоказания */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-green-700 mb-4">Показания</h2>
                <ul className="space-y-2">
                  {sampleIndications.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700 mb-4">Противопоказания</h2>
                <ul className="space-y-2">
                  {sampleContraindications.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Предупреждение */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Важно:</strong> Имеются противопоказания. Необходима консультация специалиста.
                Информация на сайте носит ознакомительный характер и не является публичной офертой.
              </p>
            </div>
          </div>
        </section>
        
        {/* Блок 5: Как проходит процедура */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-dark mb-6">Как проходит процедура</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Консультация', desc: 'Врач проводит осмотр, оценивает состояние кожи, исключает противопоказания' },
                { step: '2', title: 'Подготовка', desc: 'Очищение кожи, нанесение анестезии при необходимости' },
                { step: '3', title: 'Процедура', desc: 'Выполнение процедуры по выбранной методике' },
                { step: '4', title: 'Завершение', desc: 'Нанесение успокаивающих средств, рекомендации по уходу' }
              ].map(item => (
                <div key={item.step} className="flex gap-4 bg-white p-4 rounded-lg">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 6: Подготовка и послеуход */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-800 mb-4">Подготовка к процедуре</h2>
                <ul className="space-y-2">
                  {samplePreparation.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-blue-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-lg font-bold text-green-800 mb-4">После процедуры</h2>
                <ul className="space-y-2">
                  {sampleAftercare.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-green-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Блок 7: Врач */}
        {serviceDoctor && (
          <section className="py-8 md:py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold text-dark mb-6">Кто выполняет процедуру</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {serviceDoctor.photo ? (
                    <img 
                      src={serviceDoctor.photo} 
                      alt={serviceDoctor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark">
                    {serviceDoctor.name} {serviceDoctor.name1?.charAt(0)}. {serviceDoctor.name2?.charAt(0)}.
                  </h3>
                  <p className="text-primary font-medium mb-2">{serviceDoctor.type}</p>
                  {serviceDoctor.category && (
                    <p className="text-sm text-gray-500 mb-3">{serviceDoctor.category}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/doctors/${serviceDoctor.id}`}
                      className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors text-sm"
                    >
                      Подробнее о враче
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Блок 8: Оборудование (если применимо) */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-dark mb-6">Оборудование и технологии</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Современное оборудование', desc: 'Используем только сертифицированное оборудование последнего поколения' },
                { name: 'Качественные препараты', desc: 'Препараты с доказанной эффективностью и безопасностью' },
                { name: 'Индивидуальный подход', desc: 'Программа процедур подбирается персонально' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-dark mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 9: FAQ */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-dark mb-6">Частые вопросы</h2>
            <div className="space-y-4 max-w-3xl">
              {serviceFAQ.map((faq, idx) => (
                <details key={idx} className="group bg-white rounded-lg">
                  <summary className="cursor-pointer p-4 font-medium text-dark flex justify-between items-center">
                    {faq.question}
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 10: CTA */}
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Запишитесь на {service?.name}
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Запишитесь на консультацию к нашим специалистам. Мы подберем оптимальную программу процедур для вас.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={getTelLink()}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
              >
                {CLINIC_CONFIG.phoneFormatted}
              </a>
            </div>
          </div>
        </section>
        

      </div>
    </>
  );
}