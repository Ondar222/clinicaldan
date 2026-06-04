// components/ServicePage.tsx
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import archimedService from "../services/archimed";
import type { ApiService, ArchimedDoctor } from "../types/cms";
import AppointmentModal from "./AppointmentModal";
import SchemaOrg from "./SchemaOrg";
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
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    service?: ApiService;
  }>({
    isOpen: false,
  });

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

  const handleAppointmentClick = (service: ApiService) => {
    setAppointmentModal({
      isOpen: true,
      service,
    });
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
              
              {/* Специальный контент для кардиологии */}
              {direction.slug === 'cardiology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Когда нужно обратиться к кардиологу */}
                  <div className="bg-red-50 rounded-xl p-6 sm:p-8 border border-red-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Когда нужно обратиться к кардиологу</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Не откладывайте визит, если вас беспокоит:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боль, давление или дискомфорт в груди</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>учащённое или нерегулярное сердцебиение — аритмия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>повышенное или нестабильное артериальное давление</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>одышка при небольшой нагрузке или в покое</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>отёки ног к вечеру</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>головокружения, предобморочные состояния</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>быстрая утомляемость, слабость без видимой причины</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>перенесли инфаркт или инсульт — нужно наблюдение</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Многие сердечно-сосудистые заболевания долгое время протекают бессимптомно. Плановая консультация кардиолога раз в год рекомендована всем после 40 лет, а при наследственной предрасположенности — раньше.
                    </p>
                  </div>

                  {/* Диагностика в клинике */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Диагностика в клинике</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Большинство необходимых исследований доступны прямо в Клинике Алдан — не нужно ехать в другое место:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>ЭКГ (электрокардиография)</strong> — расшифровка в день исследования</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ сердца (эхокардиография)</strong> — оценка структуры и работы сердца</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Суточное мониторирование ЭКГ по Холтеру</strong> — запись ритма за 24 часа</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Суточное мониторирование АД</strong> — контроль давления в течение дня</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Лабораторные анализы</strong> — холестерин, липидный профиль, коагулограмма</span>
                      </li>
                    </ul>
                  </div>

                  {/* Что лечим */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Артериальная гипертония — подбор и коррекция терапии</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Ишемическая болезнь сердца (ИБС), стенокардия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Аритмии — мерцательная аритмия, экстрасистолия, тахикардия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Хроническая сердечная недостаточность</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Пороки сердца — наблюдение и ведение</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Реабилитация после инфаркта миокарда</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Профилактика инфаркта и инсульта у пациентов из группы риска</span>
                      </li>
                    </ul>
                  </div>

                  {/* Плановые осмотры и профилактика */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Плановые осмотры и профилактика</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Кардиолог также проводит профилактические осмотры для пациентов без жалоб — оценка факторов риска, ЭКГ, анализы. Это особенно важно при гипертонии у родственников, избыточном весе, курении или малоподвижном образе жизни.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Если вам нужна справка о состоянии сердечно-сосудистой системы — для водительских прав, работы или операции — кардиолог оформит заключение на приёме.
                    </p>
                  </div>

                  {/* FAQ для кардиологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Где сделать ЭКГ в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          ЭКГ выполняется в Клинике Алдан в Кызыле без предварительной записи, в день обращения. Расшифровку даёт кардиолог на месте. Клиника работает ежедневно, в будни до 22:00.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли попасть к кардиологу в Кызыле в тот же день?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, в Клинике Алдан часто есть свободные слоты для записи в день обращения. Позвоните по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> и уточните ближайшее удобное время.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Делают ли в Кызыле холтеровское мониторирование ЭКГ?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, суточное мониторирование ЭКГ по Холтеру доступно в Клинике Алдан. Прибор выдаётся на сутки, после чего врач расшифровывает запись и ставит диагноз.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">С какого возраста нужно ходить к кардиологу?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Плановый осмотр кардиолога рекомендован всем пациентам старше 40 лет раз в год. При наличии гипертонии у родственников, избыточного веса или курения — начиная с 35 лет. При жалобах на сердце — в любом возрасте.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли направление для записи к кардиологу?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет. В Клинике Алдан вы можете записаться к кардиологу самостоятельно, без направления от терапевта. Достаточно позвонить или оставить заявку онлайн.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для педиатрии */}
              {direction.slug === 'pediatrics' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Когда вести ребёнка к педиатру */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Когда вести ребёнка к педиатру</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Педиатр — первый врач, к которому обращаются при любых вопросах о здоровье ребёнка. Запишитесь, если:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>у ребёнка температура, кашель, насморк или боль в горле</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ребёнок жалуется на боль в животе, ухе или голове</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>появилась сыпь или покраснение кожи</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ребёнок вялый, плохо ест или плохо спит</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>нужна справка в садик, школу или на секцию</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>пришло время планового осмотра или профосмотра</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>нужна консультация по прививкам</span>
                      </li>
                    </ul>
                  </div>

                  {/* Детские специалисты в клинике */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Детские специалисты в клинике</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Если педиатр видит необходимость в дополнительной консультации, вы можете тут же записаться к нужному специалисту — все они работают в Клинике Алдан:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский ЛОР</strong> — уши, нос, горло</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский невролог</strong> — головные боли, задержки развития, гиперактивность</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский хирург</strong> — травмы, грыжи, хирургические патологии</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский дерматолог</strong> — кожные заболевания, аллергия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский кардиолог</strong> — сердце и сосуды</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский гинеколог</strong> — для девочек</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Детский уролог</strong> — для мальчиков</span>
                      </li>
                    </ul>
                  </div>

                  {/* Справки и документы */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Справки и документы</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Педиатр выдаёт все необходимые справки и заключения:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Справка в детский сад и школу после болезни</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Справка для бассейна, спортивной секции</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Заключение для лагеря или санатория</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Медицинская карта (форма 026/у) для школы и садика</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Справка о состоянии здоровья для различных инстанций</span>
                      </li>
                    </ul>
                  </div>

                  {/* Анализы и обследования для детей */}
                  <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Анализы и обследования для детей</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Собственная лаборатория клиники работает ежедневно. Педиатр назначит анализы и вы сдадите их сразу после приёма — не нужно приходить отдельно в другой день. Результаты готовы в тот же день.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Также доступно УЗИ органов брюшной полости, почек, сердца и других органов для детей любого возраста.
                    </p>
                  </div>

                  {/* FAQ для педиатрии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли попасть к педиатру в Кызыле без записи?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          В Клинике Алдан приём ведётся по записи — это избавляет от очереди. Позвоните по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> или запишитесь онлайн. Часто удаётся попасть в тот же день.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">До какого возраста принимает педиатр?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Педиатр в Клинике Алдан принимает детей до 18 лет. Если ребёнку нужна консультация узкого специалиста, вы можете записаться к нему прямо в клинике в тот же день.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как получить справку в садик или школу в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Запишитесь к педиатру в Клинике Алдан. Врач осмотрит ребёнка и выдаст справку на приёме. Справки для садика, школы, бассейна и секций оформляются в день обращения.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли сдать анализы ребёнку в клинике Алдан?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, лаборатория клиники работает ежедневно. Ребёнок может сдать анализы крови и мочи сразу после осмотра педиатра. Результаты готовы в день сдачи.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Есть ли в Кызыле детский невролог в частной клинике?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, в Клинике Алдан ведёт приём детский невролог. Запись через администратора по телефону <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для гинекологии */}
              {direction.slug === 'gynecology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* С чем обращаются к гинекологу */}
                  <div className="bg-pink-50 rounded-xl p-6 sm:p-8 border border-pink-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">С чем обращаются к гинекологу</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Поводов для визита к гинекологу много — не только когда что-то болит:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боли внизу живота или в пояснице</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>нарушения цикла — задержки, нерегулярные или обильные менструации</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>необычные выделения</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>подозрение на беременность или планирование беременности</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>подбор контрацепции</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>зуд, жжение, дискомфорт</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>профилактический осмотр раз в год</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>вопросы по результатам анализов или УЗИ</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>климакс и менопауза — симптомы и наблюдение</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Плановый осмотр у гинеколога раз в год — норма для каждой женщины, даже если ничего не беспокоит. Многие заболевания на ранней стадии никак не проявляются, но хорошо поддаются лечению.
                    </p>
                  </div>

                  {/* Что входит в приём */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что входит в приём</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">На первичной консультации гинеколог:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>выслушает жалобы и соберёт анамнез</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>проведёт гинекологический осмотр</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>возьмёт мазки при необходимости</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>сделает УЗИ органов малого таза — прямо на приёме</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>назначит анализы, если нужно — их можно сдать в нашей лаборатории</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>поставит диагноз и назначит лечение или наблюдение</span>
                      </li>
                    </ul>
                  </div>

                  {/* Что лечим */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Эрозия и патологии шейки матки</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Кисты яичников</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Миома матки — наблюдение и лечение</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Воспалительные заболевания — кольпит, цервицит, аднексит</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Эндометриоз</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>ИППП — диагностика и лечение</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Нарушения менструального цикла</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Бесплодие — первичная диагностика и направление</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Ведение беременности на ранних сроках</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Гормональные нарушения</span>
                      </li>
                    </ul>
                  </div>

                  {/* Анализы и УЗИ */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Анализы и УЗИ</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      После осмотра гинеколог может сразу направить на анализы или УЗИ — всё это доступно в Клинике Алдан в тот же день. Не нужно ехать в другое место или ждать несколько дней.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Результаты лабораторных анализов готовы, как правило, в день сдачи или на следующий день. Это позволяет быстрее поставить диагноз и начать лечение.
                    </p>
                  </div>

                  {/* FAQ для гинекологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как записаться к гинекологу в Кызыле без очереди?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Позвоните по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> или запишитесь онлайн через форму на сайте. В Клинике Алдан приём строго по записи — вы приходите ко времени, без ожидания.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Делают ли в Кызыле УЗИ по гинекологии?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, гинекологическое УЗИ органов малого таза выполняется в Клинике Алдан. Его можно сделать сразу на приёме у гинеколога — в тот же день и без дополнительной записи.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли готовиться к приёму гинеколога?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Специальной подготовки не требуется. Если планируется УЗИ органов малого таза трансабдоминально — придите с полным мочевым пузырём (выпейте 0,5–1 литр воды за час до приёма). Если трансвагинально — мочевой пузырь должен быть пустым.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Принимает ли гинеколог в выходные дни в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, Клиника Алдан работает в субботу и воскресенье с 09:00 до 18:00. Записаться можно по телефону или онлайн.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли сдать анализы на ИППП в частной клинике в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, в Клинике Алдан есть собственная лаборатория. Мазки на флору, посевы, анализы на ИППП можно сдать после осмотра гинеколога или отдельно. Результаты готовы в день сдачи или на следующий день.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для урологии */}
              {direction.slug === 'urology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* С какими симптомами обращаться */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">С какими симптомами обращаться</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Не откладывайте визит к урологу, если вас беспокоит:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боль или жжение при мочеиспускании</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>частые позывы в туалет, особенно ночью</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боль в пояснице, паху или промежности</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>кровь в моче</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>затруднённое мочеиспускание, слабая струя</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>отёки, повышенная температура</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>проблемы с потенцией или мужским здоровьем</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Многие урологические заболевания на ранних стадиях лечатся консервативно — таблетками и физиотерапией. Запущенные случаи нередко требуют операции. Чем раньше обратитесь, тем проще лечение.
                    </p>
                  </div>

                  {/* Что лечим */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Простатит и аденома простаты</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Мочекаменная болезнь (МКБ)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Цистит и другие инфекции мочевыводящих путей</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Пиелонефрит и заболевания почек</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Уретрит, ИППП урологического профиля</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Эректильная дисфункция</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Мужское бесплодие</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Фимоз, варикоцеле, водянка яичка</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Недержание мочи</span>
                      </li>
                    </ul>
                  </div>

                  {/* Диагностика */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Диагностика</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">На первичном приёме уролог проведёт осмотр, соберёт анамнез и при необходимости назначит обследование. Большинство исследований доступны прямо в Клинике Алдан:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Анализы мочи и крови</strong> — в нашей лаборатории, результаты в день сдачи</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ почек, мочевого пузыря и простаты</strong> — аппарат экспертного класса</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>ТРУЗИ простаты</strong></span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Урофлоуметрия</strong> — оценка скорости и качества мочеиспускания</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Мазки и посевы</strong> на инфекции</span>
                      </li>
                    </ul>
                  </div>

                  {/* Уролог и андролог — в чём разница */}
                  <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Уролог и андролог — в чём разница</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Наш специалист — уролог-андролог. Это значит, что он занимается не только болезнями мочевыводящей системы, но и мужским здоровьем в целом: гормональными нарушениями, потенцией, бесплодием.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Обращаться можно с любой из этих проблем — не нужно искать двух разных врачей.
                    </p>
                  </div>

                  {/* FAQ для урологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как попасть к урологу в Кызыле без очереди?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Запишитесь заранее по телефону <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> или через онлайн-форму на сайте. В Клинике Алдан принимают по записи, без ожидания в живой очереди.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Уролог в Кызыле — мужской или женский врач?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Уролог — специалист для пациентов любого пола. Мужчины обращаются по вопросам простаты, потенции и мочевыводящих путей. Женщины — при цистите, пиелонефрите и других заболеваниях почек и мочевого пузыря.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Что взять с собой на приём к урологу?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Возьмите результаты предыдущих анализов и УЗИ, если они есть. Перед визитом желательно не мочиться 2–3 часа — это нужно для анализа мочи, который врач может назначить сразу.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Делают ли в Кызыле УЗИ почек и простаты?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, УЗИ почек, мочевого пузыря и простаты выполняется в Клинике Алдан в Кызыле. Исследование проводится на аппарате экспертного класса, направление от уролога не обязательно.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Сколько стоит приём уролога в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Стоимость первичного приёма уточняйте по телефону <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a>. Повторный приём, как правило, дешевле первичного.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для неврологии */}
              {direction.slug === 'neurology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* С какими жалобами обращаются */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">С какими жалобами обращаются</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Невролог занимается заболеваниями головного и спинного мозга, а также периферических нервов. Среди самых частых поводов для визита:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>частые или сильные головные боли, мигрень</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>головокружения, шум в ушах</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>боль в шее, спине, пояснице</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>онемение или покалывание в руках и ногах</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>слабость в конечностях</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>нарушения сна (трудно уснуть, частые пробуждения)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ухудшение памяти и концентрации</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>дрожание рук</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>последствия травм головы</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>восстановление после инсульта</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Многие приходят к неврологу только когда боль становится невыносимой. Чем раньше разобраться с причиной, тем меньше времени и сил уйдёт на лечение.
                    </p>
                  </div>

                  {/* Что лечим */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Остеохондроз шейного, грудного, поясничного отдела</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Межпозвоночные грыжи и протрузии</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Радикулит, ишиас</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Мигрень и хронические головные боли</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Вегетососудистая дистония (ВСД)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Невриты и невралгии, в том числе тройничного нерва</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Нарушения мозгового кровообращения</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Энцефалопатия</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Эпилепсия (наблюдение и коррекция терапии)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Реабилитация после инсульта и черепно-мозговых травм</span>
                      </li>
                    </ul>
                  </div>

                  {/* Как проходит приём */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Как проходит приём</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Врач подробно выслушает жалобы, проверит рефлексы и чувствительность, оценит координацию. По итогам осмотра сразу поставит предварительный диагноз или направит на обследование.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Если потребуется МРТ или КТ, врач объяснит куда обратиться и что именно смотреть. Анализы крови можно сдать в нашей лаборатории тут же, без лишних поездок.
                    </p>
                  </div>

                  {/* Про назначения */}
                  <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Про назначения</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Хороший невролог не выписывает десятки препаратов про запас. На приёме врач объяснит причину симптомов понятным языком и составит схему лечения с чёткими сроками и ожидаемым результатом.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Никаких назначений «на всякий случай».
                    </p>
                  </div>

                  {/* FAQ для неврологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">К кому идти с головной болью — к неврологу или терапевту?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Если голова болит часто, сильно или всегда в одном месте, лучше сразу к неврологу. Терапевт исключит другие причины, но разобраться именно с головными болями поможет невролог.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Чем невролог отличается от нейрохирурга?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Невролог лечит без операции: таблетками, уколами, физиотерапией. Нейрохирург берётся за случаи, где без хирургического вмешательства не обойтись. Большинство пациентов справляются с неврологом.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли сделать МРТ перед приёмом невролога?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет, приходите без МРТ. Врач сначала осмотрит вас, и если снимки действительно нужны, выдаст направление с объяснением что именно смотреть. Делать МРТ заранее не нужно.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Помогает ли невролог при болях в спине?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, боли в спине это одна из самых частых причин обращения к неврологу. Врач определит связана ли боль с позвоночником, нервом или мышцами и назначит лечение. При необходимости направит к хирургу или ортопеду.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как записаться к неврологу в Кызыле?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Позвоните по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a> или запишитесь онлайн на сайте clinicaldan.ru. Клиника работает ежедневно, в будни до 22:00, в выходные до 18:00.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для хирургии */}
              {direction.slug === 'surgery' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* С чем приходят к хирургу */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">С чем приходят к хирургу</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Хирург занимается не только операциями. Большинство обращений вполне решается без скальпеля, на уровне консультации и назначений:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>шишки, уплотнения и узлы под кожей (липомы, кисты, атеромы)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>нагноения, абсцессы, фурункулы</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>вросший ноготь</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>раны, которые долго не заживают или воспалились</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ожоги и травмы мягких тканей</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>грыжа (паховая, пупочная, послеоперационная)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>геморрой и анальные трещины</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>родинки, папилломы, бородавки, требующие удаления</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>перевязки и обработка послеоперационных швов</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>направление на плановую операцию</span>
                      </li>
                    </ul>
                  </div>

                  {/* Малые хирургические операции */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Малые хирургические операции</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Часть вмешательств хирург выполняет прямо в клинике, под местной анестезией. Госпитализация не нужна, после процедуры можно идти домой.</p>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">К таким операциям относятся:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>вскрытие и дренирование абсцессов</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>удаление липом, атером, кист</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>удаление родинок, папиллом и кондилом</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>коррекция вросшего ногтя</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>иссечение небольших доброкачественных новообразований</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>первичная хирургическая обработка ран</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Перед любой операцией врач объяснит что именно будет делаться, какой анестетик используется и чего ожидать после процедуры. Без лишних слов и пугающих подробностей.
                    </p>
                  </div>

                  {/* Всё под одной крышей */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Всё под одной крышей</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Если хирург направит на анализы или УЗИ перед операцией, всё это можно сделать здесь же, в Клинике Алдан. Лаборатория работает ежедневно, результаты готовы в день сдачи.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Это экономит время и убирает лишние поездки.
                    </p>
                  </div>

                  {/* Когда нельзя ждать */}
                  <div className="bg-red-50 rounded-xl p-6 sm:p-8 border border-red-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Когда нельзя ждать</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Некоторые ситуации требуют срочного обращения к хирургу. Не тяните, если появились:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">⚠</span>
                        <span>сильная боль в животе, особенно с температурой</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">⚠</span>
                        <span>быстро нарастающий отёк или покраснение вокруг раны</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">⚠</span>
                        <span>гной или сильное воспаление</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">⚠</span>
                        <span>вправимая грыжа перестала вправляться и болит</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      При острых состояниях звоните сразу. Администратор подскажет, можно ли помочь в клинике или нужно ехать в скорую.
                    </p>
                  </div>

                  {/* FAQ для хирургии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли направление чтобы попасть к хирургу?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет, в Клинике Алдан можно записаться к хирургу самостоятельно, без направления от терапевта. Достаточно позвонить по номеру <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a>.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Удаляют ли родинки и папилломы в Кызыле в частной клинике?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, хирург Клиники Алдан удаляет доброкачественные новообразования: родинки, папилломы, кондиломы, атеромы, липомы. Процедура проводится под местной анестезией, госпитализация не нужна.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Что делать если нарыв или абсцесс?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Обратитесь к хирургу как можно скорее. Не пытайтесь вскрыть самостоятельно. Врач вскроет абсцесс в стерильных условиях, промоет и поставит дренаж, назначит лечение. Запись по телефону <a href="tel:+79233176060" className="text-primary hover:underline font-medium">+7 (923) 317-60-60</a>.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Сколько длится операция по удалению кисты или липомы?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Небольшие доброкачественные образования удаляются за 20-40 минут под местной анестезией. После процедуры можно уходить домой. Точное время зависит от размера и расположения образования.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли готовиться к хирургической консультации?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Специальной подготовки нет. Если уже были анализы или результаты УЗИ по вашей проблеме, возьмите их с собой. Если нет, хирург назначит нужное обследование на приёме.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для офтальмологии */}
              {direction.slug === 'ophthalmology' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Когда стоит записаться */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Когда стоит записаться</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Поводов для визита к офтальмологу больше, чем кажется:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>зрение стало хуже, предметы вдали или вблизи расплываются</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>глаза быстро устают за компьютером или от чтения</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ощущение песка, сухости или жжения</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>покраснение глаз, которое не проходит несколько дней</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>мелькание мушек, вспышек или пятен перед глазами</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>давление или боль в области глаз</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>травма глаза или попадание инородного тела</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>плановый осмотр для подбора очков или контактных линз</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>ребёнку нужно обследование перед школой</span>
                      </li>
                    </ul>
                  </div>

                  {/* Что делает офтальмолог на приёме */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что делает офтальмолог на приёме</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Осмотр занимает 20-30 минут. Врач проверит остроту зрения, осмотрит глазное дно, измерит внутриглазное давление и оценит состояние роговицы и хрусталика.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Если нужно подобрать очки или линзы, подберёт рецепт прямо на приёме. При выявлении серьёзной патологии врач объяснит ситуацию, назначит лечение или направит к узкому специалисту.
                    </p>
                  </div>

                  {/* Что лечим */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Что лечим</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Близорукость (миопия) и дальнозоркость</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Астигматизм</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Глаукома (повышенное внутриглазное давление)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Катаракта на начальных стадиях</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Синдром сухого глаза</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Конъюнктивит и блефарит</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Ячмень и халязион</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Нарушения зрения у детей, в том числе косоглазие</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">✓</span>
                        <span>Диабетическая ретинопатия (наблюдение)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Дети и офтальмолог */}
                  <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Дети и офтальмолог</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Первый осмотр офтальмолога рекомендуется пройти в год, затем в 3 года и перед поступлением в школу. Многие нарушения зрения у детей хорошо поддаются коррекции именно в раннем возрасте. Позже лечить сложнее и дольше.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      В Клинике Алдан офтальмолог принимает детей и умеет работать с маленькими пациентами, которые не всегда могут описать свои ощущения словами.
                    </p>
                  </div>

                  {/* Подбор очков и контактных линз */}
                  <div className="bg-pink-50 rounded-xl p-6 sm:p-8 border border-pink-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Подбор очков и контактных линз</h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Если носите очки или линзы, проверяйте рецепт раз в год. Зрение меняется, и устаревший рецепт даёт дополнительную нагрузку на глаза. Врач проверит актуальные показатели и при необходимости скорректирует рецепт.
                    </p>
                  </div>

                  {/* FAQ для офтальмологии */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Офтальмолог и окулист — это один и тот же врач?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, это одна и та же специальность. «Окулист» — старое название, которое до сих пор используют в народе. «Офтальмолог» — официальное медицинское название. Оба занимаются диагностикой и лечением заболеваний глаз.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как часто нужно ходить к офтальмологу?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Взрослым без жалоб достаточно одного планового осмотра в год. Тем, кто носит очки или линзы, а также пациентам с глаукомой или диабетом, лучше приходить чаще — по рекомендации врача. Детям осмотры нужны в 1 год, 3 года и перед школой.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли в Кызыле подобрать очки у офтальмолога?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, офтальмолог в Клинике Алдан проверит зрение и выпишет рецепт на очки или контактные линзы прямо на приёме. С готовым рецептом можно обратиться в любой оптический салон.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">С какого возраста ребёнку нужен осмотр офтальмолога?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Первый осмотр рекомендуется в возрасте одного года. Потом в 3 года и перед поступлением в первый класс. Ранняя диагностика помогает скорректировать нарушения зрения пока глаз ещё формируется.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли готовиться к приёму офтальмолога?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Специальной подготовки нет. Если вы носите очки или линзы, возьмите их с собой. Если планируется расширение зрачка каплями, лучше приехать с сопровождающим, потому что после процедуры зрение временно расплывается и за руль садиться не стоит.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Специальный контент для УЗИ */}
              {direction.slug === 'ultrasound' && (
                <div className="space-y-6 sm:space-y-8">
                  {/* Виды УЗИ в клинике */}
                  <div className="bg-blue-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Виды УЗИ в клинике</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Мы выполняем широкий спектр ультразвуковых исследований для взрослых и детей:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ органов брюшной полости (печень, желчный пузырь, поджелудочная, селезёнка)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ почек и мочевого пузыря</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ органов малого таза (матка, яичники, мочевой пузырь)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ щитовидной железы</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ молочных желёз</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>Эхокардиография (УЗИ сердца)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗДГ сосудов (допплерография вен и артерий)</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ мягких тканей, суставов</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ органов мошонки</span>
                      </li>
                      <li className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                        <span className="text-primary mt-1">•</span>
                        <span>УЗИ при беременности на ранних сроках</span>
                      </li>
                    </ul>
                  </div>

                  {/* Результат сразу */}
                  <div className="bg-green-50 rounded-xl p-6 sm:p-8 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Результат сразу, без ожидания</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      После исследования врач выдаёт заключение в тот же день. Не нужно ждать несколько суток или приходить второй раз за бумагой.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Если исследование назначил другой специалист нашей клиники, он сразу увидит результат и скорректирует лечение.
                    </p>
                  </div>

                  {/* Аппарат экспертного класса */}
                  <div className="bg-purple-50 rounded-xl p-6 sm:p-8 border border-purple-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Аппарат экспертного класса</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Качество снимка напрямую влияет на точность диагноза. Мы работаем на современном оборудовании с высоким разрешением, которое позволяет увидеть даже небольшие изменения в тканях и органах.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Это важно при диагностике узлов щитовидной железы, кист, новообразований и сосудистых патологий.
                    </p>
                  </div>

                  {/* УЗИ за один визит с врачом */}
                  <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">УЗИ за один визит с врачом</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">
                      Удобно, когда осмотр у специалиста и УЗИ происходят в один день. Например, гинеколог осматривает пациентку и сразу направляет на УЗИ малого таза — и уже через час у врача есть полная картина.
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      То же самое работает с кардиологом и УЗИ сердца, с урологом и УЗИ почек. Лишних поездок нет.
                    </p>
                  </div>

                  {/* Как подготовиться */}
                  <div className="bg-pink-50 rounded-xl p-6 sm:p-8 border border-pink-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Как подготовиться</h3>
                    <p className="text-gray-700 text-sm sm:text-base mb-4">Подготовка зависит от вида исследования. Основные правила:</p>
                    <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ брюшной полости</strong> — натощак, за 3-4 часа до исследования не есть и не пить</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ малого таза трансабдоминально</strong> — прийти с полным мочевым пузырём (выпить 0.5-1 литр воды за час до исследования)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ малого таза трансвагинально</strong> — мочевой пузырь должен быть пустым</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>УЗИ щитовидной железы, молочных желёз, сердца, сосудов, мягких тканей</strong> — специальной подготовки не требуется</span>
                      </li>
                    </ul>
                    <p className="text-gray-600 text-xs sm:text-sm mt-4 italic">
                      Если не уверены как готовиться, позвоните администратору — подскажем конкретно под ваш вид исследования.
                    </p>
                  </div>

                  {/* FAQ для УЗИ */}
                  <div className="bg-amber-50 rounded-xl p-6 sm:p-8 border border-amber-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Частые вопросы</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Нужно ли направление для УЗИ?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет, прийти на УЗИ можно без направления от врача. Достаточно записаться по телефону и уточнить какой именно вид исследования вам нужен.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Как быстро готовы результаты УЗИ?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Заключение выдаётся в день исследования, сразу после процедуры. Ждать несколько дней не придётся.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Можно ли сделать УЗИ ребёнку?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Да, в Клинике Алдан УЗИ проводится детям любого возраста. Ультразвук полностью безопасен и не имеет ограничений по возрасту.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Больно ли делать УЗИ?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Нет, УЗИ безболезненно. Врач наносит на кожу специальный гель и водит датчиком по поверхности тела. Единственный дискомфорт возможен при трансвагинальном УЗИ, но он минимален.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2">Что взять с собой на УЗИ?</h4>
                        <p className="text-gray-700 text-xs sm:text-sm">
                          Возьмите направление, если оно есть, и результаты предыдущих исследований для сравнения. Для некоторых видов УЗИ нужна пелёнка или полотенце, но в клинике они обычно есть. Уточните при записи.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                          <div className="flex flex-col gap-2 mt-auto pt-2 sm:pt-3">
                            <span className="text-primary font-bold text-sm sm:text-base md:text-lg">
                              {getServicePrice(service).toLocaleString("ru-RU")}{" "}
                              ₽
                            </span>
                            <button
                              onClick={() => handleAppointmentClick(service)}
                              className="w-full px-3 py-1.5 bg-primary text-white text-xs sm:text-sm rounded hover:bg-primaryDark transition-colors font-medium flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Запись онлайн
                            </button>
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

      {/* Schema.org structured data for SEO */}
      <SchemaOrg
        pageName={direction.seoTitle || direction.title}
        pageDescription={direction.seoDescription || direction.description}
        pageUrl={`https://clinicaldan.ru/services/${direction.slug}`}
        breadcrumbs={[
          { name: 'Главная', url: '/' },
          { name: direction.title, url: `/services/${direction.slug}` }
        ]}
        services={effectiveServices.slice(0, 10).map(s => ({
          name: s.name,
          description: s.info || s.altname,
          price: getServicePrice(s),
          currency: 'RUB'
        }))}
        doctors={filteredDoctors.slice(0, 10).map(d => ({
          name: getDoctorFullName(d),
          specialty: d.type,
          image: d.photo?.startsWith('data:') ? undefined : (d.photo || undefined),
          description: d.info
        }))}
        faqs={
          direction.slug === 'cardiology'
            ? [
                { question: 'Где сделать ЭКГ в Кызыле?', answer: 'ЭКГ выполняется в Клинике Алдан в Кызыле без предварительной записи, в день обращения. Расшифровку даёт кардиолог на месте.' },
                { question: 'Можно ли попасть к кардиологу в Кызыле в тот же день?', answer: 'Да, в Клинике Алдан часто есть свободные слоты для записи в день обращения.' },
                { question: 'Делают ли в Кызыле холтеровское мониторирование ЭКГ?', answer: 'Да, суточное мониторирование ЭКГ по Холтеру доступно в Клинике Алдан.' },
                { question: 'С какого возраста нужно ходить к кардиологу?', answer: 'Плановый осмотр кардиолога рекомендован всем пациентам старше 40 лет раз в год.' },
                { question: 'Нужно ли направление для записи к кардиологу?', answer: 'Нет. В Клинике Алдан вы можете записаться к кардиологу самостоятельно, без направления от терапевта.' }
              ]
            : direction.slug === 'pediatrics'
            ? [
                { question: 'Можно ли попасть к педиатру в Кызыле без записи?', answer: 'В Клинике Алдан приём ведётся по записи — это избавляет от очереди. Часто удаётся попасть в тот же день.' },
                { question: 'До какого возраста принимает педиатр?', answer: 'Педиатр в Клинике Алдан принимает детей до 18 лет.' },
                { question: 'Как получить справку в садик или школу в Кызыле?', answer: 'Запишитесь к педиатру в Клинике Алдан. Справки оформляются в день обращения.' },
                { question: 'Можно ли сдать анализы ребёнку в клинике Алдан?', answer: 'Да, лаборатория клиники работает ежедневно. Результаты готовы в день сдачи.' },
                { question: 'Есть ли в Кызыле детский невролог в частной клинике?', answer: 'Да, в Клинике Алдан ведёт приём детский невролог.' }
              ]
            : direction.slug === 'gynecology'
            ? [
                { question: 'Как записаться к гинекологу в Кызыле без очереди?', answer: 'Позвоните по номеру +7 (923) 317-60-60 или запишитесь онлайн. Приём строго по записи.' },
                { question: 'Делают ли в Кызыле УЗИ по гинекологии?', answer: 'Да, гинекологическое УЗИ выполняется в Клинике Алдан, можно сделать сразу на приёме.' },
                { question: 'Нужно ли готовиться к приёму гинеколога?', answer: 'Специальной подготовки не требуется. Для УЗИ трансабдоминально придите с полным мочевым пузырём.' },
                { question: 'Принимает ли гинеколог в выходные дни в Кызыле?', answer: 'Да, Клиника Алдан работает в субботу и воскресенье с 09:00 до 18:00.' },
                { question: 'Можно ли сдать анализы на ИППП в частной клинике в Кызыле?', answer: 'Да, в Клинике Алдан есть собственная лаборатория. Результаты готовы в день сдачи.' }
              ]
            : direction.slug === 'urology'
            ? [
                { question: 'Как попасть к урологу в Кызыле без очереди?', answer: 'Запишитесь заранее по телефону +7 (923) 317-60-60 или через онлайн-форму. Приём по записи, без ожидания.' },
                { question: 'Уролог в Кызыле — мужской или женский врач?', answer: 'Уролог — специалист для пациентов любого пола. Мужчины — по вопросам простаты и потенции. Женщины — при цистите, пиелонефрите.' },
                { question: 'Что взять с собой на приём к урологу?', answer: 'Результаты предыдущих анализов и УЗИ. Перед визитом желательно не мочиться 2–3 часа для анализа мочи.' },
                { question: 'Делают ли в Кызыле УЗИ почек и простаты?', answer: 'Да, УЗИ почек, мочевого пузыря и простаты выполняется в Клинике Алдан на аппарате экспертного класса.' },
                { question: 'Сколько стоит приём уролога в Кызыле?', answer: 'Стоимость первичного приёма уточняйте по телефону +7 (923) 317-60-60. Повторный приём дешевле.' }
              ]
            : direction.slug === 'neurology'
            ? [
                { question: 'К кому идти с головной болью — к неврологу или терапевту?', answer: 'Если голова болит часто или сильно, лучше сразу к неврологу. Терапевт исключит другие причины, но с головными болями поможет невролог.' },
                { question: 'Чем невролог отличается от нейрохирурга?', answer: 'Невролог лечит без операции: таблетками, уколами, физиотерапией. Нейрохирург — для случаев, где нужна операция. Большинство справляются с неврологом.' },
                { question: 'Нужно ли сделать МРТ перед приёмом невролога?', answer: 'Нет, приходите без МРТ. Врач осмотрит вас и если снимки нужны, выдаст направление с объяснением что именно смотреть.' },
                { question: 'Помогает ли невролог при болях в спине?', answer: 'Да, боли в спине — одна из самых частых причин обращения. Врач определит связь с позвоночником, нервом или мышцами и назначит лечение.' },
                { question: 'Как записаться к неврологу в Кызыле?', answer: 'Позвоните по номеру +7 (923) 317-60-60 или запишитесь онлайн. Клиника работает ежедневно, в будни до 22:00.' }
              ]
            : direction.slug === 'surgery'
            ? [
                { question: 'Нужно ли направление чтобы попасть к хирургу?', answer: 'Нет, в Клинике Алдан можно записаться к хирургу самостоятельно, без направления. Достаточно позвонить по телефону +7 (923) 317-60-60.' },
                { question: 'Удаляют ли родинки и папилломы в Кызыле в частной клинике?', answer: 'Да, хирург удаляет доброкачественные новообразования под местной анестезией. Госпитализация не нужна.' },
                { question: 'Что делать если нарыв или абсцесс?', answer: 'Обратитесь к хирургу как можно скорее. Не вскрывайте самостоятельно. Врач обработает в стерильных условиях. Запись по телефону +7 (923) 317-60-60.' },
                { question: 'Сколько длится операция по удалению кисты или липомы?', answer: 'Небольшие образования удаляются за 20-40 минут под местной анестезией. После процедуры можно уходить домой.' },
                { question: 'Нужно ли готовиться к хирургической консультации?', answer: 'Специальной подготовки нет. Возьмите с собой предыдущие анализы и УЗИ, если есть. Хирург назначит нужное на приёме.' }
              ]
            : direction.slug === 'ophthalmology'
            ? [
                { question: 'Офтальмолог и окулист — это один и тот же врач?', answer: 'Да, это одна и та же специальность. «Окулист» — старое название, «офтальмолог» — официальное. Оба занимаются диагностикой и лечением заболеваний глаз.' },
                { question: 'Как часто нужно ходить к офтальмологу?', answer: 'Взрослым без жалоб достаточно одного осмотра в год. Носителям очков/линз и пациентам с глаукомой/диабетом — чаще по рекомендации. Детям — в 1 год, 3 года и перед школой.' },
                { question: 'Можно ли в Кызыле подобрать очки у офтальмолога?', answer: 'Да, офтальмолог проверит зрение и выпишет рецепт на очки или линзы прямо на приёме.' },
                { question: 'С какого возраста ребёнку нужен осмотр офтальмолога?', answer: 'Первый осмотр в 1 год, затем в 3 года и перед школой. Ранняя диагностика помогает скорректировать нарушения пока глаз формируется.' },
                { question: 'Нужно ли готовиться к приёму офтальмолога?', answer: 'Специальной подготовки нет. Возьмите очки/линзы с собой. После расширения зрачка лучше приехать с сопровождающим.' }
              ]
            : direction.slug === 'ultrasound'
            ? [
                { question: 'Нужно ли направление для УЗИ?', answer: 'Нет, можно записаться без направления. Достаточно позвонить и уточнить вид исследования.' },
                { question: 'Как быстро готовы результаты УЗИ?', answer: 'Заключение выдаётся в день исследования, сразу после процедуры. Ждать не придётся.' },
                { question: 'Можно ли сделать УЗИ ребёнку?', answer: 'Да, УЗИ проводится детям любого возраста. Ультразвук безопасен и не имеет ограничений по возрасту.' },
                { question: 'Больно ли делать УЗИ?', answer: 'Нет, УЗИ безболезненно. Врач наносит гель и водит датчиком по телу. Минимальный дискомфорт возможен только при трансвагинальном УЗИ.' },
                { question: 'Что взять с собой на УЗИ?', answer: 'Возьмите направление и результаты предыдущих исследований. Для некоторых видов нужна пелёнка или полотенце — уточните при записи.' }
              ]
            : direction.slug === 'vascular-surgery-phlebology'
            ? [
                { question: 'Сколько стоит приём флеболога в Кызыле?', answer: 'Стоимость первичного приёма сосудистого хирурга-флеболога уточняйте по телефону +7 (923) 317-60-60.' },
                { question: 'Нужно ли направление от терапевта?', answer: 'Нет, вы можете записаться к сосудистому хирургу самостоятельно, без направления.' },
                { question: 'Делают ли в клинике УЗИ вен?', answer: 'Да, дуплексное сканирование вен нижних конечностей выполняется в Клинике Алдан.' },
                { question: 'Как записаться к флебологу в Кызыле?', answer: 'Позвоните по номеру +7 (923) 317-60-60 или воспользуйтесь формой онлайн-записи на сайте.' }
              ]
            : undefined
        }
      />

      {/* Модальное окно записи на прием */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={() => setAppointmentModal({ isOpen: false })}
        service={appointmentModal.service}
      />
    </div>
  );
};

export default ServicePage;
