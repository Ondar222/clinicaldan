import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import archimedService from "../services/archimed";
import {
  SERVICE_CATEGORIES,
  groupServicesByCategory,
} from "../services/serviceCategories";
import type { ApiService } from "../types/cms";
import { CategoryIcon, ICON_PATHS } from "./CategoryIcon";

const LaboratoryDiagnosticsPage: React.FC = () => {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const servicesData = await archimedService.getServices();
        setServices(servicesData);
      } catch (err) {
        console.error("Ошибка загрузки услуг:", err);
        setError("Не удалось загрузить данные об услугах. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  // Фильтруем только лабораторные услуги
  const laboratoryServices = useMemo(() => {
    const labCategory = SERVICE_CATEGORIES.find((c) => c.id === "laboratory");
    if (!labCategory) return [];

    return services.filter((service) =>
      labCategory.keywords.some(
        (keyword) =>
          service.name.toLowerCase().includes(keyword) ||
          service.group_name?.toLowerCase().includes(keyword) ||
          service.altname?.toLowerCase().includes(keyword),
      ),
    );
  }, [services]);

  // Группируем лабораторные услуги по подкатегориям
  const groupedServices = useMemo(() => {
    const groups: { [key: string]: ApiService[] } = {
      blood: [],
      urine: [],
      biochemistry: [],
      hormones: [],
      infections: [],
      cytology: [],
      other: [],
    };

    laboratoryServices.forEach((service) => {
      const name = service.name.toLowerCase();
      const group = service.group_name?.toLowerCase() || "";

      if (
        name.includes("кровь") ||
        name.includes("гематолог") ||
        group.includes("кровь")
      ) {
        groups.blood.push(service);
      } else if (
        name.includes("моча") ||
        name.includes("мочев") ||
        group.includes("моча")
      ) {
        groups.urine.push(service);
      } else if (
        name.includes("биохими") ||
        name.includes("глюкоз") ||
        name.includes("холестерин") ||
        group.includes("биохими")
      ) {
        groups.biochemistry.push(service);
      } else if (
        name.includes("гормон") ||
        name.includes("тирео") ||
        name.includes("эстроген") ||
        group.includes("гормон")
      ) {
        groups.hormones.push(service);
      } else if (
        name.includes("инфекц") ||
        name.includes("вирус") ||
        name.includes("бактери") ||
        name.includes("посев") ||
        group.includes("инфекц")
      ) {
        groups.infections.push(service);
      } else if (
        name.includes("цитолог") ||
        name.includes("мазок") ||
        name.includes("онкоцитолог") ||
        group.includes("цитолог")
      ) {
        groups.cytology.push(service);
      } else {
        groups.other.push(service);
      }
    });

    return groups;
  }, [laboratoryServices]);

  const getServicePrice = (service: ApiService): number => {
    return service.base_cost || 0;
  };

  const categoryNames = {
    blood: "Анализы крови",
    urine: "Анализы мочи",
    biochemistry: "Биохимические анализы",
    hormones: "Гормональные исследования",
    infections: "Анализы на инфекции",
    cytology: "Цитологические исследования",
    other: "Другие анализы",
  };

  const categoryIcons = {
    blood: "blood",
    urine: "flask",
    biochemistry: "layers",
    hormones: "medicalCross",
    infections: "shield",
    cytology: "endoscopy",
    other: "checkups",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-3 sm:mb-4">
              Лабораторная диагностика
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              Загружаем данные...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark mb-4">
              Ошибка загрузки
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Герой-секция */}
      <section
        className="py-12 sm:py-16 md:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: `url(/bg-hero.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-3 sm:px-4 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            Лабораторная диагностика
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Полный спектр лабораторных исследований для точной диагностики
          </p>
        </div>
      </section>

      {/* Услуги лабораторной диагностики */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            Виды анализов
          </h2>

          {/* Фильтр по категориям */}
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
                Все анализы
              </button>
              {Object.entries(categoryNames).map(([key, name]) => {
                const services =
                  groupedServices[key as keyof typeof groupedServices];
                if (services.length === 0) return null;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === key
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <CategoryIcon
                      d={
                        ICON_PATHS[
                          categoryIcons[key as keyof typeof categoryIcons]
                        ] ?? ICON_PATHS.other
                      }
                      className="h-4 w-4"
                    />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Отображение услуг */}
          {selectedCategory === "all" ? (
            // Показываем все услуги, сгруппированные по категориям
            <div className="space-y-8">
              {Object.entries(groupedServices).map(([key, services]) => {
                if (services.length === 0) return null;

                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CategoryIcon
                        d={
                          ICON_PATHS[
                            categoryIcons[key as keyof typeof categoryIcons]
                          ] ?? ICON_PATHS.other
                        }
                        className="h-6 w-6 sm:h-8 sm:w-8 text-primary"
                      />
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                          {categoryNames[key as keyof typeof categoryNames]}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {services.length} анализов
                        </p>
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
                          Показать ещё {services.length - 6} анализов
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
              {groupedServices[
                selectedCategory as keyof typeof groupedServices
              ]?.map((service) => (
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
        </div>
      </section>

      {/* Информация о подготовке к анализам */}
      <section className="py-8 sm:py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12">
            Подготовка к анализам
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Анализы крови
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Сдавать натощак (8-12 часов без еды)</li>
                <li>• Можно пить воду</li>
                <li>• Избегать физических нагрузок</li>
                <li>• Не курить за час до сдачи</li>
              </ul>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Анализы мочи
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Утренняя порция мочи</li>
                <li>• Тщательный туалет половых органов</li>
                <li>• Средняя порция мочи</li>
                <li>• Стерильная посуда</li>
              </ul>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Гормональные анализы
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Строго натощак</li>
                <li>• В определенные дни цикла</li>
                <li>• Отмена гормональных препаратов</li>
                <li>• Консультация врача</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LaboratoryDiagnosticsPage;
