/**
 * Страница отделения косметологии /services/cosmetology
 * Полноценный коммерческий раздел с каталогом услуг
 */

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CLINIC_CONFIG, getMailLink, getTelLink } from "../data/clinicConfig";
import {
  COSMETOLOGY_CATEGORIES,
  type CosmetologyCategory,
  getCategoryBySlug,
  getCosmetologyCategory,
  isExcludedCosmetologyDoctor,
} from "../data/cosmetology";
import archimedService from "../services/archimed";
import type { ApiService, ArchimedDoctor } from "../types/cms";
import { getDoctorExperience } from "../utils/doctorExperience";
import AppointmentModal from "./AppointmentModal";
import SchemaOrg from "./SchemaOrg";
import { SeoHead } from "./SeoHead";

interface CosmetologyPageProps {
  categorySlug?: string;
}

export default function CosmetologyPage({
  categorySlug,
}: CosmetologyPageProps) {
  // Состояния
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [allServices, setAllServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categorySlug || "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const ITEMS_PER_PAGE = 10;
  const [problemModal, setProblemModal] = useState<{
    isOpen: boolean;
    problem?: {
      title: string;
      desc: string;
      fullDesc: string;
      categorySlug: string;
      icon: React.ReactNode;
    };
  }>({ isOpen: false });

  // Состояния для модального окна записи
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<
    ApiService | undefined
  >(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<
    ArchimedDoctor | undefined
  >(undefined);

  // Параметры URL
  const doctorFilter = searchParams.get("doctor");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Загружаем врачей
        const doctorsData = await archimedService.getDoctors();
        // Фильтруем косметологов
        const cosmetologists = (doctorsData || []).filter((d) => {
          const type = (d.type || "").toLowerCase();
          return (
            (type.includes("космет") || type.includes("дерматовенеролог")) &&
            !isExcludedCosmetologyDoctor(d)
          );
        });
        setDoctors(cosmetologists);

        // Загружаем все услуги
        const servicesData = await archimedService.getServices();
        setAllServices(servicesData || []);
      } catch (err) {
        console.error("Error loading cosmetology data:", err);
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
    if (selectedCategory !== "all") {
      const category = getCategoryBySlug(selectedCategory);
      if (category) {
        services = services.filter((s) => {
          const text = `${s.name} ${s.group_name}`.toLowerCase();
          return category.keywords.some((k) => text.includes(k));
        });
      }
    } else {
      // Для "Все услуги" показываем только услуги косметологии
      services = services.filter(
        (s) => getCosmetologyCategory(s.name, s.group_name) !== null,
      );
    }

    // Фильтр по врачу
    if (doctorFilter) {
      // Здесь можно добавить фильтрацию по конкретному врачу
    }

    return services;
  }, [allServices, selectedCategory, doctorFilter]);

  // Пагинация
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  // Сброс страницы при смене категории
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  // Скролл к услугам с выбором категории
  const scrollToServices = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    const el = document.getElementById("cosmetology-services");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Открытие модального окна записи
  const handleOpenAppointment = (
    service?: ApiService,
    doctor?: ArchimedDoctor,
  ) => {
    setSelectedService(service);
    setSelectedDoctor(doctor);
    setIsAppointmentModalOpen(true);
  };

  // Получить всех косметологов для услуги
  const getServiceDoctors = (): ArchimedDoctor[] => {
    return doctors.filter((d) => {
      const docText = `${d.type} ${d.name}`.toLowerCase();
      return docText.includes("космет") || docText.includes("дерматовенеролог");
    });
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    if (price === 0) return "Цена уточняется";
    return `${price.toLocaleString("ru-RU")} ₽`;
  };

  // SEO данные
  const currentCategory = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const pageTitle = currentCategory
    ? `${currentCategory.name} в Кызыле — Клиника Алдан`
    : "Косметология в Кызыле — услуги эстетической медицины | Клиника Алдан";
  const pageDescription = currentCategory
    ? `${currentCategory.description} Запись на прием к косметологу по телефону ${CLINIC_CONFIG.phoneFormatted}.`
    : "Косметология в Клинике Алдан: инъекционная и аппаратная косметология, пилинги, чистки лица, уходовые процедуры. Опытные косметологи. Современное оборудование. Запись онлайн.";

  const seoData = {
    title: pageTitle,
    description: pageDescription,
    canonical: categorySlug
      ? `/services/cosmetology/${categorySlug}`
      : "/services/cosmetology",
    ogType: "website" as const,
  };

  // Хлебные крошки
  const breadcrumbs = [
    { name: "Главная", url: "https://clinicaldan.ru/" },
    { name: "Услуги", url: "/services" },
    { name: "Косметология", url: "/services/cosmetology" },
  ];
  if (currentCategory) {
    breadcrumbs.push({
      name: currentCategory.name,
      url: `/services/cosmetology/${currentCategory.slug}`,
    });
  }

  return (
    <>
      <SeoHead pageData={seoData} />

      {/* Schema.org */}
      <SchemaOrg
        pageName={currentCategory?.name || "Косметология"}
        pageDescription={pageDescription}
        pageUrl={`https://clinicaldan.ru${categorySlug ? `/services/cosmetology/${categorySlug}` : "/services/cosmetology"}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
        {/* Блок 1: Первый экран с фоном как в слайдере */}
        <section
          className="relative py-16 md:py-24 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url('/bg-hero.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            {/* Хлебные крошки */}
            <nav className="flex items-center gap-2 text-sm text-white/80 mb-8">
              <Link to="/" className="hover:text-white transition-colors">
                Главная
              </Link>
              <span>/</span>
              <Link
                to="/services"
                className="hover:text-white transition-colors"
              >
                Услуги
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Косметология</span>
            </nav>

            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {currentCategory ? currentCategory.name : "Косметология"}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {currentCategory
                  ? currentCategory.description
                  : "Современная эстетическая медицина в Кызыле. Инъекционная и аппаратная косметология, пилинги, уходовые процедуры от сертифицированных специалистов."}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() =>
                    document
                      .getElementById("cosmetology-services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Смотреть цены
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("cosmetology-doctors")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
                >
                  Наши специалисты
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Блок 4: Врачи */}
        <section id="cosmetology-doctors" className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                Наши косметологи
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Опытные специалисты с многолетней практикой
              </p>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-gray-500">
                  Информация о врачах загружается...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300 h-full"
                  >
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden mb-3">
                        {doctor.photo ? (
                          <img
                            src={doctor.photo}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-8 h-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 w-full">
                        <h3 className="font-semibold text-dark text-sm mb-0.5 leading-tight">
                          {doctor.name} {doctor.name1?.charAt(0)}.{" "}
                          {doctor.name2?.charAt(0)}.
                        </h3>
                        <p className="text-xs text-primary font-medium mb-1.5 min-h-[16px]">
                          {doctor.type}
                        </p>
                        <p className="text-[11px] text-gray-500 mb-2 leading-snug min-h-[28px]">
                          {doctor.category || "\u00A0"}
                        </p>
                        <div className="mt-auto pt-1">
                          <Link
                            to={`/doctors/${doctor.id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          >
                            <span>Подробнее</span>
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Блок 2: Какие задачи мы решаем */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                Какие задачи мы решаем
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Комплексный подход к решению эстетических проблем кожи лица и
                тела
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Возрастные изменения",
                  desc: "Морщины, потеря упругости",
                  fullDesc:
                    "Боремся с мимическими и возрастными морщинами, дряблостью кожи, опущением овала лица. Применяем ботулинотерапию, контурную пластику филлерами, мезотерапию, биоревитализацию, а также аппаратные методы: RF-лифтинг, SMAS-лифтинг и лазерное омоложение.",
                  categorySlug: "injection",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Тусклый цвет лица",
                  desc: "Неровный тон, пигментация",
                  fullDesc:
                    "Устраняем пигментные пятна, поствоспалительную гиперпигментацию, серый цвет лица. Подбираем химические пилинги различной глубины, фотоомоложение, лазерную шлифовку и уходовые программы с витамином C.",
                  categorySlug: "peelings",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Акне и постакне",
                  desc: "Высыпания, рубцы",
                  fullDesc:
                    "Лечим акне любой стадии, угревую сыпь, расширенные поры, рубцы и пятна после прыщей. Проводим профессиональную чистку лица (механическую, УЗ, комбинированную), пилинги, постакне-терапию и подбираем домашний уход.",
                  categorySlug: "cleaning",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Сосудистые сетки",
                  desc: "Купероз, звездочки",
                  fullDesc:
                    "Удаляем сосудистые звёздочки, телеангиэктазии, купероз и покраснения. Используем лазерную терапию, IPL-технологии и специальные уходовые программы для укрепления стенок сосудов.",
                  categorySlug: "vascular",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Сухость кожи",
                  desc: "Обезвоживание, шелушение",
                  fullDesc:
                    "Восстанавливаем водный баланс, устраняем шелушение и чувство стянутости. Назначаем глубокоувлажняющие уходы, мезотерапию с гиалуроновой кислотой, биоревитализацию и подбираем домашнюю косметику.",
                  categorySlug: "care",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Жировые отложения",
                  desc: "Второй подбородок, щеки",
                  fullDesc:
                    "Корректируем локальные жировые отложения на лице и теле. Применяем липолитические инъекции, криолиполиз, кавитацию, RF-липолиз и лимфодренажный массаж для моделирования контуров.",
                  categorySlug: "body",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Коррекция фигуры",
                  desc: "Целлюлит, контуры",
                  fullDesc:
                    "Боремся с целлюлитом, дряблостью кожи, лишним объёмом. Комплекс аппаратных процедур: вакуумный массаж, кавитация, RF-лифтинг тела, прессотерапия и обёртывания для подтяжки и уменьшения объёмов.",
                  categorySlug: "body",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Подбор ухода",
                  desc: "Индивидуальная программа",
                  fullDesc:
                    "Проводим компьютерную диагностику кожи, определяем тип и состояние. На основе результатов составляем персональную программу процедур и подбираем профессиональную косметику для домашнего ухода.",
                  categorySlug: "skin-diagnostics",
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setProblemModal({ isOpen: true, problem: item })
                  }
                  className="group relative bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-left w-full"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-dark mb-1 text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-primary text-xs font-medium">
                    <span>Подробнее</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Модальное окно задачи */}
        {problemModal.isOpen && problemModal.problem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setProblemModal({ isOpen: false })}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-[fadeIn_0.2s_ease-out]">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    {problemModal.problem.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-dark">
                      {problemModal.problem.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {problemModal.problem.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setProblemModal({ isOpen: false })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {problemModal.problem.fullDesc}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setProblemModal({ isOpen: false })}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Понятно
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Блок 3: Каталог услуг */}
        <section id="cosmetology-services" className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark mb-6">
              Услуги косметологии
            </h2>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  selectedCategory === "all"
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-sm"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <span>Все услуги</span>
              </button>
              {COSMETOLOGY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:shadow-sm"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Карточки у��лу�� */}
            {/* Счётчик */}
            {!isLoading && filteredServices.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                Показано {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredServices.length,
                )}{" "}
                из {filteredServices.length} услуг
              </p>
            )}

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 animate-pulse border border-gray-100"
                  >
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">Услуги не найдены</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {paginatedServices.map((service) => {
                  const serviceDoctors = getServiceDoctors();
                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <svg
                              className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                            <h3 className="text-lg font-semibold text-dark">
                              {service.name}
                            </h3>
                          </div>
                          {service.info && (
                            <p className="text-gray-600 mb-4 pl-8">
                              {service.info}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 pl-8">
                            {service.duration > 0 && (
                              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {service.duration} мин
                              </span>
                            )}
                            {serviceDoctors.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1 text-gray-400">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Врачи:
                                </span>
                                {serviceDoctors.map((doc) => (
                                  <Link
                                    key={doc.id}
                                    to={`/doctors/${doc.id}`}
                                    className="flex items-center gap-1 text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-full"
                                  >
                                    {doc.name} {doc.name1?.charAt(0)}.{" "}
                                    {doc.name2?.charAt(0)}.
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 pl-8 md:pl-0">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(service.base_cost)}
                          </div>
                          <button
                            onClick={() =>
                              handleOpenAppointment(service, undefined)
                            }
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            Записаться
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  ← Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0) {
                      const prev = arr[idx - 1];
                      if (page - prev > 1) acc.push("...");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === item
                            ? "bg-primary text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Вперёд →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Блок 5: Оборудование */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                Оборудование и технологии
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Современное сертифицированное оборудование для лучших
                результатов
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Лазерная система",
                  desc: "Лазерное омоложение, удаление сосудов",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                },
                {
                  name: "RF-аппарат",
                  desc: "Радиоволновой лифтинг",
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
                // { name: 'Аппарат SMAS', desc: 'Ультразвуковой SMAS-лифтинг', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary transition-all duration-300">
                    <svg
                      className="w-7 h-7 text-primary group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-dark text-lg mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Блок 7: Показания и противопоказания */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 text-lg mb-2">
                      Важная информация
                    </h3>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      Имеются противопоказания. Необходима консультация
                      специалиста. Информация на сайте носит ознакомительный
                      характер и не является публичной офертой. Перед
                      проведением процедур обязательно проконсультируйтесь с
                      врачом.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Блок 8: FAQ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                Частые вопросы
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ответы на популярные вопросы о косметологических процедурах
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "Как выбрать процедуру косметологии?",
                  a: "Выбор процедуры зависит от ваших индивидуальных особенностей. На консультации врач проведет диагностику и подберет оптимальный курс.",
                },
                {
                  q: "Нужна ли консультация перед процедурой?",
                  a: "Да, обязательно. Врач должен убедиться в отсутствии противопоказаний и подобрать подходящую методику.",
                },
                {
                  q: "Когда будет виден эффект?",
                  a: "Эффект зависит от процедуры. После ботокса — через 2 недели, аппаратные — накопительный, до 3 месяцев.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary/30 transition-all"
                >
                  <summary className="cursor-pointer p-5 font-medium text-dark flex justify-between items-center hover:bg-white/50 transition-colors">
                    <span className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-primary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {faq.q}
                    </span>
                    <svg
                      className="w-5 h-5 text-primary transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Блок 9: CTA */}
        <section
          className="py-16 md:py-24 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), url('/bg-hero.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Запишитесь на консультацию косметолога
              </h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                Опытные специалисты Клиники Алдан подберут индивидуальную
                программу омоложения с учетом особенностей вашей кожи.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={getTelLink()}
                  className="px-10 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl text-lg"
                >
                  {CLINIC_CONFIG.phoneFormatted}
                </a>
                <button
                  onClick={() => handleOpenAppointment()}
                  className="px-10 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg"
                >
                  Записаться онлайн
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Модальное окно записи */}
        <AppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          service={selectedService}
          doctor={selectedDoctor}
        />
      </div>
    </>
  );
}
