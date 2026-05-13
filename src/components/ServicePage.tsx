// components/ServicePage.tsx
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import archimedService from "../services/archimed";
import type { ApiService, ArchimedDoctor } from "../types/cms";
import { getDirectionBySlug, keywordMatch } from "../services/directions";
import {
  SERVICE_CATEGORIES,
  SERVICE_SUBCATEGORIES,
  groupServicesByCategory,
  getServiceCategory,
  getServiceSubcategory,
} from "../services/serviceCategories";
import { tools } from "../data/tools";

const ServicePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [doctors, setDoctors] = useState<ArchimedDoctor[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const direction = useMemo(
    () => (slug ? getDirectionBySlug(slug) : undefined),
    [slug]
  );

  // Update SEO meta tags when direction changes
  useEffect(() => {
    if (!direction) return;

    // Update document title
    const title = direction.seoTitle || `${direction.title} в Кызыле | Клиника Алдан`;
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      'content',
      direction.seoDescription || direction.description
    );

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (direction.seoKeywords) {
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', direction.seoKeywords);
    } else if (metaKeywords) {
      // Remove keywords meta if not provided
      metaKeywords.remove();
    }

    // Cleanup function to restore default meta tags when component unmounts
    return () => {
      document.title = 'Клиника Алдан';
      const defaultDescription = 'Клиника Алдан - современная медицинская клиника с высококвалифицированными специалистами. Широкий спектр медицинских услуг в Кызыле.';
      const desc = document.querySelector('meta[name="description"]');
      if (desc) {
        desc.setAttribute('content', defaultDescription);
      }
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        keywords.remove();
      }
    };
  }, [direction]);

  useEffect(() => {
    // Всегда поднимаем страницу вверх при смене направления
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Мгновенно показываем данные из кэша, если они есть
    const cachedServices = archimedService.getServicesCache();
    const cachedDoctors = archimedService.getDoctorsCache();
    if (cachedServices?.length) setServices(cachedServices);
    if (cachedDoctors?.length) setDoctors(cachedDoctors);

    // Подтягиваем актуальные данные только если кэша нет
    const needFetch =
      (cachedServices?.length || 0) === 0 || (cachedDoctors?.length || 0) === 0;
    if (!needFetch) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [allServices, allDoctors] = await Promise.all([
          archimedService.getServices(),
          archimedService.getDoctors(),
        ]);
        setServices(allServices);
        setDoctors(allDoctors);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить данные. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [slug]);

  if (!direction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Направление не найдено</h1>
          <Link to="/" className="text-primary hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const filteredServices = useMemo(() => {
    if (!direction) return [] as ApiService[];
    return services.filter(
      (s) =>
        keywordMatch(s.group_name, direction.serviceKeywords) ||
        keywordMatch(s.name, direction.serviceKeywords) ||
        keywordMatch(s.altname, direction.serviceKeywords)
    );
  }, [services, direction]);

  // Шаблонные услуги для раздела Пластическая хирургия (если из API ничего не пришло)
  const plasticFallbackServices: ApiService[] = useMemo(
    () => [
      {
        id: 90001,
        kind: 0,
        code: "PS-001",
        name: "Консультация пластического хирурга",
        altcode: "",
        altname: "",
        barcode: "",
        info: "Первичная консультация с осмотром и планированием вмешательства",
        group_name: "Пластическая хирургия",
        group_id: 0,
        mz_code: "",
        cito_cost: 0,
        duration: 0,
        base_cost: 1800,
        purchase_price: 0,
        denomination: 0,
        unit_id: null,
        unit: null,
      },
      {
        id: 90002,
        kind: 0,
        code: "PS-002",
        name: "Блефаропластика",
        altcode: "",
        altname: "Хирургическая коррекция век",
        barcode: "",
        info: "",
        group_name: "Пластическая хирургия",
        group_id: 0,
        mz_code: "",
        cito_cost: 0,
        duration: 0,
        base_cost: 45000,
        purchase_price: 0,
        denomination: 0,
        unit_id: null,
        unit: null,
      },

      {
        id: 90004,
        kind: 0,
        code: "PS-004",
        name: "Липосакция",
        altcode: "",
        altname: "Удаление локальных жировых отложений",
        barcode: "",
        info: "",
        group_name: "Пластическая хирургия",
        group_id: 0,
        mz_code: "",
        cito_cost: 0,
        duration: 0,
        base_cost: 80000,
        purchase_price: 0,
        denomination: 0,
        unit_id: null,
        unit: null,
      },

      {
        id: 90006,
        kind: 0,
        code: "PS-006",
        name: "Отопластика",
        altcode: "",
        altname: "Коррекция формы ушей",
        barcode: "",
        info: "",
        group_name: "Пластическая хирургия",
        group_id: 0,
        mz_code: "",
        cito_cost: 0,
        duration: 0,
        base_cost: 60000,
        purchase_price: 0,
        denomination: 0,
        unit_id: null,
        unit: null,
      },
    ],
    []
  );

  // Если услуг нет, подставляем шаблонные для пластической хирургии
  const effectiveServices = useMemo(() => {
    if (
      direction?.slug === "plastic-surgery" &&
      filteredServices.length === 0
    ) {
      return plasticFallbackServices;
    }
    return filteredServices;
  }, [direction, filteredServices, plasticFallbackServices]);

  // Группируем услуги по категориям
  const groupedServices = useMemo(() => {
    return groupServicesByCategory(effectiveServices, direction?.title);
  }, [effectiveServices, direction]);

  // Получаем доступные категории для текущего направления
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    Object.keys(groupedServices).forEach((key) => {
      const categoryId = key.split("-")[0];
      const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
      if (category) {
        categories.add(categoryId);
      }
    });
    return Array.from(categories)
      .map((id) => SERVICE_CATEGORIES.find((c) => c.id === id))
      .filter(Boolean);
  }, [groupedServices]);

  // Получаем услуги для выбранной категории
  const servicesForCategory = useMemo(() => {
    if (selectedCategory === "all") {
      return effectiveServices;
    }

    const categoryServices: ApiService[] = [];
    Object.entries(groupedServices).forEach(([key, services]) => {
      if (key.startsWith(selectedCategory)) {
        categoryServices.push(...services);
      }
    });

    return categoryServices;
  }, [selectedCategory, groupedServices, effectiveServices]);

  const filteredDoctors = useMemo(() => {
    if (!direction) return [] as ArchimedDoctor[];
    return doctors.filter((d) => {
      // Hide admin/test entries (e.g., Администратор, Арбаев)
      const nameBlob = `${d?.name || ""} ${d?.name1 || ""} ${d?.name2 || ""} ${d?.info || ""} ${d?.type || ""}`.toLowerCase();
      if (/(администратор|archimed|арбаев)/i.test(nameBlob)) return false;
      
      const types = (d?.types || []).map((t) => t.name).join(" ");
      return (
        keywordMatch(d.type, direction.doctorKeywords) ||
        keywordMatch(types, direction.doctorKeywords)
      );
    });
  }, [doctors, direction]);

  const getServicePrice = (service: ApiService): number => {
    return service.cito_cost > 0 ? service.cito_cost : service.base_cost;
  };

  const getDoctorFullName = (doctor: ArchimedDoctor) => {
    return `${doctor.name} ${doctor.name1} ${doctor.name2}`;
  };

  const getDoctorInitials = (doctor: ArchimedDoctor) => {
    return `${doctor?.name} ${doctor?.name1?.charAt(0)}. ${doctor?.name2?.charAt(0)}.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хлебные крошки */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition-colors duration-200">
              Главная
            </Link>
            <span>/</span>
            <span className="text-gray-900">{direction.title}</span>
          </nav>
        </div>
      </div>

      {/* Кнопка возврата на главную */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex items-center text-primary hover:text-primaryDark text-sm sm:text-base transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад на главную
        </Link>
      </div>

      {/* Герой-секция направления */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: `url(/bg-hero.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
            {direction.title}
          </h1>
        </div>
      </section>

      {/* Описание направления */}
      {direction.description && (
        <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Описание с красивыми отступами */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-sm border border-gray-100 mb-6 sm:mb-8">
                <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                  <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose mb-0 indent-0 sm:indent-0">
                    {direction.description}
                  </p>
                </div>
              </div>
              
              {/* Специальный контент для флебологии */}
              {direction.slug === 'vascular-surgery-phlebology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Когда нужно обратиться к флебологу */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Когда нужно обратиться к флебологу</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Запишитесь на приём, если вас беспокоит хотя бы один из этих симптомов:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>тяжесть и усталость в ногах к вечеру</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>отёки щиколоток и голеней</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>видимые вены, выступающие над кожей</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>сосудистые звёздочки и сеточки на ногах</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>судороги в икрах по ночам</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боль и жжение по ходу вен</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>изменение цвета кожи на голенях</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Чем раньше вы обратитесь к специалисту, тем проще и дешевле лечение. Запущенный варикоз требует хирургического вмешательства, а на ранней стадии достаточно консервативной терапии.
                    </p>
                  </div>

                  {/* Что мы лечим */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что мы лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Варикозное расширение вен нижних конечностей</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Хроническая венозная недостаточность</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Сосудистые звёздочки и телеангиэктазии</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Тромбофлебит и тромбоз вен</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Трофические язвы голеней</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Лимфостаз нижних конечностей</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Заболевания артерий нижних конечностей</span>
                      </li>
                    </ul>
                  </div>

                  {/* Диагностика и лечение */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Диагностика и лечение</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      На первичном приёме сосудистый хирург проведёт осмотр, соберёт анамнез и при необходимости направит на ультразвуковое дуплексное сканирование вен — оно выполняется прямо в клинике в тот же день.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base mb-4 font-medium">По результатам обследования врач подберёт лечение:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Консервативное лечение</strong> — компрессионная терапия, флебопротекторы</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Склеротерапия</strong> — введение препарата в вену для её закрытия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Лазерная коагуляция</strong> сосудистых звёздочек</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Хирургическое лечение</strong> при запущенных формах варикоза</span>
                      </li>
                    </ul>
                  </div>

                  {/* FAQ для флебологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Сколько стоит приём флеболога в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Стоимость первичного приёма сосудистого хирурга-флеболога уточняйте по телефону <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a>. Мы стараемся держать цены доступными для жителей Кызыла и Республики Тыва.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли направление от терапевта?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет, вы можете записаться к сосудистому хирургу самостоятельно, без направления. Достаточно позвонить или оставить заявку онлайн.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Делают ли в клинике УЗИ вен?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, дуплексное сканирование вен нижних конечностей выполняется в Клинике Алдан в Кызыле. Исследование можно пройти в день обращения.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как записаться к флебологу в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Позвоните по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> или воспользуйтесь формой онлайн-записи на сайте. Клиника работает ежедневно, в будни до 22:00.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Список услуг */}
              {effectiveServices.length > 0 && (
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 px-2">
                    Услуги по направлению "{direction.title}":
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 px-2">
                    {effectiveServices.slice(0, 9).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base md:text-lg text-gray-700 hover:text-primary transition-colors duration-200 group"
                      >
                        <span className="text-primary mt-1 sm:mt-1.5 text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform duration-200">•</span>
                        <span className="leading-relaxed">{service.name}</span>
                      </div>
                    ))}
                  </div>
                  {effectiveServices.length > 9 && (
                    <p className="text-gray-600 text-sm sm:text-base mt-4 sm:mt-6 italic px-2 text-center sm:text-left">
                      и ещё {effectiveServices.length - 9} услуг
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Услуги в рамках этого направления */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-gray-900">
            Услуги по направлению "{direction.title}"
          </h2>

          {/* Фильтр по категориям */}
          {availableCategories.length > 0 && (
            <div className="mb-6 sm:mb-8 md:mb-10">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all duration-200 ${
                    selectedCategory === "all"
                      ? "bg-primary text-white shadow-md scale-105"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm"
                  }`}
                >
                  Все услуги
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category!.id}
                    onClick={() => setSelectedCategory(category!.id)}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === category!.id
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-base sm:text-lg md:text-xl">{category!.icon}</span>
                    <span className="whitespace-nowrap">{category!.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Отображение услуг по категориям */}
          {selectedCategory === "all" ? (
            // Показываем все услуги, сгруппированные по категориям
            <div className="space-y-8">
              {Object.entries(groupedServices).map(([key, services]) => {
                const categoryId = key.split("-")[0];
                const subcategoryId = key.split("-")[1];
                const category = SERVICE_CATEGORIES.find(
                  (c) => c.id === categoryId
                );
                const subcategory = subcategoryId
                  ? SERVICE_SUBCATEGORIES.find((s) => s.id === key)
                  : null;

                return (
                  <div key={key} className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-3xl md:text-4xl">{category?.icon}</span>
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                          {category?.name}
                        </h3>
                        {subcategory && (
                          <p className="text-sm sm:text-base text-gray-600 mt-1">
                            {subcategory.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                      {services.slice(0, 6).map((service) => (
                        <div
                          key={service.id}
                          className="bg-white p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                        >
                          <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg leading-tight">
                            {service.name}
                          </h4>
                          {service.altname &&
                            service.altname !== service.name && (
                              <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm italic leading-relaxed">
                                {service.altname}
                              </p>
                            )}
                          <div className="flex justify-between items-center mt-auto pt-2 sm:pt-3">
                            <span className="text-primary font-bold text-sm sm:text-base md:text-lg">
                              {getServicePrice(service).toLocaleString("ru-RU")}{" "}
                              ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {services.length > 6 && (
                      <div className="text-center mt-4 sm:mt-6">
                        <button className="text-primary text-sm sm:text-base hover:underline font-medium transition-colors duration-200">
                          Показать ещё {services.length - 6} услуг
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Показываем услуги выбранной категории
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {(showAllServices
                ? servicesForCategory
                : servicesForCategory.slice(0, 6)
              ).map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 leading-tight">
                      {service.name}
                    </h3>
                    {service.altname && service.altname !== service.name && (
                      <p className="text-gray-600 mb-2 sm:mb-3 text-xs sm:text-sm italic leading-relaxed">
                        {service.altname}
                      </p>
                    )}
                    {service.info && (
                      <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-4">
                        {service.info}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4">
                    <span className="text-primary font-bold text-base sm:text-lg">
                      {getServicePrice(service).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {servicesForCategory.length > 6 && selectedCategory !== "all" && (
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={() => setShowAllServices((s) => !s)}
                className="px-4 sm:px-6 py-1.5 sm:py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors text-sm sm:text-base"
              >
                {showAllServices ? "Скрыть" : "Показать ещё"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Врачи направления */}
      {filteredDoctors.length > 0 && (
        <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-gray-900">
              Наши специалисты
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  <div className="h-28 sm:h-44 bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                    {doctor.photo ? (
                      <>
                        <img
                          src={
                            doctor.photo.startsWith("data:")
                              ? doctor.photo
                              : doctor.photo
                          }
                          alt={getDoctorInitials(doctor)}
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover object-[50%_30%] border-3 sm:border-4 border-white"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const nextElement = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = "flex";
                            }
                          }}
                        />
                        <div
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <svg
                            className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 sm:w-12 sm:h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-5 flex flex-col flex-grow">
                    <h3 className="text-base sm:text-lg font-semibold text-dark mb-1.5">
                      {getDoctorFullName(doctor)}
                    </h3>
                    <p className="text-primary font-medium mb-2 text-xs sm:text-sm">
                      {doctor.type}
                    </p>
                    {doctor.branch && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 leading-relaxed">
                        {doctor.branch}
                      </p>
                    )}
                    <div className="mt-auto">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="inline-block w-full px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors font-medium text-xs sm:text-sm text-center"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Инструменты для этого направления */}
      {(() => {
        const relatedTools = tools.filter(tool => 
          tool.directions?.includes(direction.slug)
        );
        
        if (relatedTools.length === 0) return null;
        
        return (
          <section className="py-6 sm:py-8 md:py-10 lg:py-12 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-900">
                Оборудование и технологии
              </h2>
              <p className="text-gray-600 text-center mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto text-sm sm:text-base">
                Современное оборудование, которое мы используем для диагностики и лечения по направлению "{direction.title}"
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {relatedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={tool.image}
                        alt={tool.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16'%3EНет изображения%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm leading-tight line-clamp-2">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 text-[10px] sm:text-xs leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default ServicePage;
