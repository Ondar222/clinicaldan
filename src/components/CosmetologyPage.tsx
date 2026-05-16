/**
 * Страница отделения косметологии /services/cosmetology
 * Полноценный коммерческий раздел с каталогом услуг
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SeoHead } from './SeoHead';
import SchemaOrg from './SchemaOrg';
import { 
  COSMETOLOGY_CATEGORIES, 
  getCosmetologyCategory, 
  getCategoryBySlug,
  type CosmetologyCategory 
} from '../data/cosmetology';
import { CLINIC_CONFIG, getTelLink, getMailLink } from '../data/clinicConfig';
import type { ArchimedDoctor, ApiService } from '../types/cms';
import archimedService from '../services/archimed';
import { getDoctorExperience } from '../utils/doctorExperience';

interface CosmetologyPageProps {
  categorySlug?: string;
}

export default function CosmetologyPage({ categorySlug }: CosmetologyPageProps) {
  // Состояния
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [allServices, setAllServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || 'all');
  const [searchParams] = useSearchParams();
  
  // Параметры URL
  const doctorFilter = searchParams.get('doctor');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Загружаем врачей
        const doctorsData = await archimedService.getDoctors();
        // Фильтруем косметологов
        const cosmetologists = (doctorsData || []).filter(d => {
          const type = (d.type || '').toLowerCase();
          return type.includes('космет') || type.includes('дерматовенеролог');
        });
        setDoctors(cosmetologists);
        
        // Загружаем все услуги
        const servicesData = await archimedService.getServices();
        setAllServices(servicesData || []);
        
      } catch (err) {
        console.error('Error loading cosmetology data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Фильтрация услуг по категории
  const filteredServices = useMemo(() => {
    let services = allServices;
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      const category = getCategoryBySlug(selectedCategory);
      if (category) {
        services = services.filter(s => {
          const text = `${s.name} ${s.group_name}`.toLowerCase();
          return category.keywords.some(k => text.includes(k));
        });
      }
    }
    
    // Фильтр по врачу
    if (doctorFilter) {
      // Здесь можно добавить фильтрацию по конкретному врачу
    }
    
    return services;
  }, [allServices, selectedCategory, doctorFilter]);
  
  // Получить связанного врача для услуги
  const getServiceDoctor = (service: ApiService): ArchimedDoctor | undefined => {
    // Ищем врача по ключевым словам в названии услуги
    const serviceText = `${service.name} ${service.group_name}`.toLowerCase();
    return doctors.find(d => {
      const docText = `${d.type} ${d.name}`.toLowerCase();
      return docText.includes('космет') || docText.includes('дерматовенеролог');
    });
  };
  
  // Форматирование цены
  const formatPrice = (price: number) => {
    if (price === 0) return 'Цена уточняется';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };
  
  // SEO данные
  const currentCategory = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const pageTitle = currentCategory 
    ? `${currentCategory.name} в Кызыле — Клиника Алдан`
    : 'Косметология в Кызыле — услуги эстетической медицины | Клиника Алдан';
  const pageDescription = currentCategory
    ? `${currentCategory.description} Запись на прием к косметологу по телефону ${CLINIC_CONFIG.phoneFormatted}.`
    : 'Косметология в Клинике Алдан: инъекционная и аппаратная косметология, пилинги, чистки лица, уходовые процедуры. Опытные косметологи. Современное оборудование. Запись онлайн.';
  
  const seoData = {
    title: pageTitle,
    description: pageDescription,
    canonical: categorySlug ? `/services/cosmetology/${categorySlug}` : '/services/cosmetology',
    ogType: 'website' as const
  };
  
  // Хлебные крошки
  const breadcrumbs = [
    { name: 'Главная', url: 'https://clinicaldan.ru/' },
    { name: 'Услуги', url: '/services' },
    { name: 'Косметология', url: '/services/cosmetology' }
  ];
  if (currentCategory) {
    breadcrumbs.push({ name: currentCategory.name, url: `/services/cosmetology/${currentCategory.slug}` });
  }
  
  return (
    <>
      <SeoHead pageData={seoData} />
      
      {/* Schema.org */}
      <SchemaOrg
        pageName={currentCategory?.name || 'Косметология'}
        pageDescription={pageDescription}
        pageUrl={`https://clinicaldan.ru${categorySlug ? `/services/cosmetology/${categorySlug}` : '/services/cosmetology'}`}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Блок 1: Первый экран */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Хлебные крошки */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-primary">Главная</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-primary">Услуги</Link>
              <span>/</span>
              <span className="text-dark font-medium">Косметология</span>
            </nav>
            
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
                {currentCategory ? currentCategory.name : 'Косметология'}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                {currentCategory 
                  ? currentCategory.description 
                  : 'Современная эстетическая медицина в Кызыле. Инъекционная и аппаратная косметология, пилинги, уходовые процедуры от сертифицированных специалистов.'
                }
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/prices"
                  className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Смотреть цены
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Блок 2: Какие задачи решаем */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Какие задачи мы решаем</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { task: 'Возрастные изменения', desc: 'Морщины, потеря упругости' },
                { task: 'Тусклый цвет лица', desc: 'Неровный тон, пигментация' },
                { task: 'Акне и постакне', desc: 'Высыпания, рубцы' },
                { task: 'Сосудистые сетки', desc: 'Купероз, звездочки' },
                { task: 'Сухость кожи', desc: 'Обезвоживание, шелушение' },
                { task: 'Жировые отложения', desc: 'Второй подбородок, щеки' },
                { task: 'Коррекция фигуры', desc: 'Целлюлит, контуры' },
                { task: 'Подбор ухода', desc: 'Индивидуальная программа' }
              ].map((item, idx) => (
                <Link
                  key={idx}
                  to={`/services/cosmetology?problem=${idx}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-dark mb-1">{item.task}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 3: Каталог услуг */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Услуги косметологии</h2>
            
            {/* Фильтры */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg border ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                Все услуги
              </button>
              {COSMETOLOGY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
            
            {/* Карточки у��лу�� */}
            {isLoading ? (
              <div className="grid gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">Услуги не найдены</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredServices.map(service => {
                  const serviceDoctor = getServiceDoctor(service);
                  return (
                    <div 
                      key={service.id} 
                      className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-dark mb-2">{service.name}</h3>
                          {service.info && (
                            <p className="text-gray-600 mb-3">{service.info}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            {service.duration > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {service.duration} мин
                              </span>
                            )}
                            {serviceDoctor && (
                              <Link 
                                to={`/doctors/${serviceDoctor.id}`}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {serviceDoctor.name} {serviceDoctor.name1?.charAt(0)}. {serviceDoctor.name2?.charAt(0)}.
                              </Link>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <div className="text-xl md:text-2xl font-bold text-primary">
                            {formatPrice(service.base_cost)}
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        
        {/* Блок 4: Врачи */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Наши косметологи</h2>
            
            {doctors.length === 0 ? (
              <p className="text-gray-500">Информация о врачах загружается...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                  <div key={doctor.id} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {doctor.photo ? (
                        <img 
                          src={doctor.photo} 
                          alt={doctor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark">
                        {doctor.name} {doctor.name1?.charAt(0)}. {doctor.name2?.charAt(0)}.
                      </h3>
                      <p className="text-sm text-primary mb-1">{doctor.type}</p>
                      {doctor.category && (
                        <p className="text-xs text-gray-500">{doctor.category}</p>
                      )}
                      <div className="mt-2">
                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Блок 5: Оборудование */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Оборудование и технологии</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Лазерная система', desc: 'Лазерное омоложение, удаление сосудов' },
                { name: 'RF-аппарат', desc: 'Радиоволновой лифтинг' },
                { name: 'Аппарат SMAS', desc: 'Ультразвуковой SMAS-лифтинг' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-dark mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 6: Как проходит прием */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Как проходит прием</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Консультация', desc: 'Врач проводит осмотр, диагностику кожи, собирает анамнез' },
                { step: '2', title: 'Диагностика', desc: 'При необходимости — аппаратная диагностика состояния кожи' },
                { step: '3', title: 'Подбор процедур', desc: 'Врач рекомендует процедуры с учетом показаний' },
                { step: '4', title: 'Процедура', desc: 'Выполнение процедуры в комфортных условиях' },
                { step: '5', title: 'Рекомендации', desc: 'Врач дает рекомендации по уходу после процедуры' },
                { step: '6', title: 'Наблюдение', desc: 'При необходимости — повторный визит для контроля' }
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 7: Показания и противопоказания */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Важно:</strong> Имеется противопоказания. Необходима консультация специалиста. 
                Информация на сайте носит ознакомительный характер и не является публичной офертой.
              </p>
            </div>
          </div>
        </section>
        
        {/* Блок 8: FAQ */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">Частые вопросы</h2>
            <div className="space-y-4">
              {[
                { q: 'Как выбрать процедуру косметологии?', a: 'Выбор процедуры зависит от ваших индивидуальных особенностей. На консультации врач проведет диагностику и подберет оптимальный курс.' },
                { q: 'Нужна ли консультация перед процедурой?', a: 'Да, обязательно. Врач должен убедиться в отсутствии противопоказаний.' },
                { q: 'Когда будет виден эффект?', a: 'Эффект зависит от процедуры. После ботокса — через 2 недели, аппаратные — накопительный, до 3 месяцев.' }
              ].map((faq, idx) => (
                <details key={idx} className="group bg-gray-50 rounded-lg">
                  <summary className="cursor-pointer p-4 font-medium text-dark flex justify-between items-center">
                    {faq.q}
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-gray-600">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
        
        {/* Блок 9: CTA */}
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Запишитесь на консультацию косметолога
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Опытные специалисты Клиники Алдан подберут индивидуальную программу омоложения 
              с учетом особенностей вашей кожи.
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
