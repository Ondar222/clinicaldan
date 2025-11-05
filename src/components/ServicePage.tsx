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
import AppointmentModal from "./AppointmentModal";

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
    doctor?: ArchimedDoctor;
  }>({
    isOpen: false,
  });

  const direction = useMemo(
    () => (slug ? getDirectionBySlug(slug) : undefined),
    [slug]
  );

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

  const getDoctorInitials = (doctor: ArchimedDoctor) => {
    return `${doctor?.name} ${doctor?.name1?.charAt(0)}. ${doctor?.name2?.charAt(0)}.`;
  };

  const handleAppointmentClick = (
    service?: ApiService,
    doctor?: ArchimedDoctor
  ) => {
    setAppointmentModal({
      isOpen: true,
      service,
      doctor,
    });
  };

  const handleAppointmentSuccess = () => {
    // Можно добавить уведомление об успешной записи
    console.log("Appointment created successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Герой-секция направления */}
      <section
        className="py-12 sm:py-16 md:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: `url(/bg-hero.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-3 sm:px-4 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            {direction.title}
          </h1>
        </div>
      </section>

      {/* Если потребуется текст описания — его можно подтягивать из CMS позже */}

      {/* Услуги в рамках этого направления */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            Услуги по направлению "{direction.title}"
          </h2>

          {/* Фильтр по категориям */}
          {availableCategories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Все услуги
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category!.id}
                    onClick={() => setSelectedCategory(category!.id)}
                    className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === category!.id
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <span>{category!.icon}</span>
                    {category!.name}
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
                  <div key={key} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{category?.icon}</span>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                          {category?.name}
                        </h3>
                        {subcategory && (
                          <p className="text-sm text-gray-600">
                            {subcategory.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.slice(0, 6).map((service) => (
                        <div
                          key={service.id}
                          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                            {service.name}
                          </h4>
                          {service.altname &&
                            service.altname !== service.name && (
                              <p className="text-gray-600 mb-2 text-xs italic">
                                {service.altname}
                              </p>
                            )}
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-bold text-sm">
                              {getServicePrice(service).toLocaleString("ru-RU")}{" "}
                              ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {services.length > 6 && (
                      <div className="text-center mt-4">
                        <button className="text-primary text-sm hover:underline">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
        <section className="py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
              Наши специалисты
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden text-center flex flex-col h-full"
                >
                  <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-100 flex items-center justify-center">
                    {doctor.photo ? (
                      <img
                        src={
                          (new Image().src = `data:image/png;base64,${doctor.photo}`) as unknown as string
                        }
                        alt={getDoctorInitials(doctor)}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover object-[50%_30%]"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm sm:text-base">
                        Фото отсутствует
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                      {getDoctorInitials(doctor)}
                    </h3>
                    <p className="text-gray-600 mb-3 leading-relaxed text-sm sm:text-base">
                      {doctor.type}
                    </p>
                    {doctor.branch && (
                      <p className="text-gray-500 text-xs sm:text-sm mb-4 leading-relaxed">
                        {doctor.branch}
                      </p>
                    )}
                    <div className="mt-auto">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors font-medium text-xs sm:text-sm"
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

      {/* Кнопка записи */}
      <section className="py-8 sm:py-10 md:py-12 bg-primary">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          {/* <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">
            Записаться на прием: {direction.title}
          </h2> */}
          <p className="text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Оставьте заявку и наш администратор свяжется с вами для уточнения
            деталей записи
          </p>
          <button
            onClick={() => handleAppointmentClick()}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base md:text-lg"
          >
            Записаться онлайн
          </button>
        </div>
      </section>

      {/* Модальное окно записи на прием */}
      <AppointmentModal
        isOpen={appointmentModal.isOpen}
        onClose={() => setAppointmentModal({ isOpen: false })}
        service={appointmentModal.service}
        doctor={appointmentModal.doctor}
        onSuccess={handleAppointmentSuccess}
      />
    </div>
  );
};

export default ServicePage;
