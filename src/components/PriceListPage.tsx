import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import archimedService from "../services/archimed";
import type { ApiService } from "../types/cms";
import { CategoryIcon, ICON_PATHS } from "./CategoryIcon";
import SchemaOrg from "./SchemaOrg";
import { SeoHead } from "./SeoHead";

interface PriceSubgroup {
  name: string;
  services: ApiService[];
}

interface PriceCategory {
  id: string;
  name: string;
  icon: ReactNode;
  subgroups: PriceSubgroup[];
  count: number;
}

const OTHER_CATEGORY_ID = "other";

function getServicePrice(service: ApiService): number {
  return service.cito_cost > 0 ? service.cito_cost : service.base_cost;
}

// Нормализация для поиска: нижний регистр, ё→е, латинские двойники → кириллица
const LATIN_TO_CYR: Record<string, string> = {
  a: "а",
  b: "в",
  c: "с",
  e: "е",
  h: "н",
  k: "к",
  m: "м",
  o: "о",
  p: "р",
  t: "т",
  x: "х",
  y: "у",
};

function normalizeSearch(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[abcehkmopxy]/g, (ch) => LATIN_TO_CYR[ch] ?? ch)
    .trim();
}

// Иконки в стиле Heroicons (outline, 24x24) — общий модуль CategoryIcon.tsx

interface CategoryRule {
  test: RegExp;
  id: string;
  icon: string;
  name: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    test: /лаборатор|анализ|генетик|днк|отцовств|родств|экспертиз|гормон|инфекц|цитолог|мазок|посев|забор/i,
    id: "laboratory",
    icon: "laboratory",
    name: "Лабораторная диагностика",
  },
  {
    test: /узи|ультразвук|сонограф|эхограф|допплер/i,
    id: "ultrasound",
    icon: "ultrasound",
    name: "УЗИ",
  },
  { test: /рентген/i, id: "xray", icon: "xray", name: "Рентген" },
  {
    test: /функциональн|экг|холтер|спирометр|эхокардио|суточн|мониторинг/i,
    id: "functional",
    icon: "functional",
    name: "Функциональная диагностика",
  },
  {
    test: /эндоскоп|гастроскоп|колоноскоп|фгдс|бронхоскоп|ректороманоскоп/i,
    id: "endoscopy",
    icon: "endoscopy",
    name: "Эндоскопия",
  },
  {
    test: /хирург|операци|лазер|склероз|склеротерап|вмешательств|блокад|перевязк|укол|инъекц|ботулин|prp|фистул|удалени|гемангиом|атенолол|полидактил|обрезани|иссечени|эктоми|пункци|томия|пластик|дезартеризац|шв|комисси|выписк|вскрыти|вправлен|бужировани|вазелин|тромб|булхорн|кантопекси|установк|нит/i,
    id: "surgery",
    icon: "surgery",
    name: "Хирургия и процедуры",
  },
  {
    test: /консульт|прием |осмотр|гинеколог|уролог|кардиолог|невролог|терапевт|педиатр|дерматолог|косметолог|проктолог|психиатр|эпилептолог|флеболог|ревматолог|офтальмолог|отоларинг|ортопед|эндокринолог|аллерголог|нефролог|гастроэнтеролог|онколог|маммолог|сосудистый/i,
    id: "consultations",
    icon: "consultations",
    name: "Консультации специалистов",
  },
  {
    test: /космет|эстетик|пилинг|ботокс|мезо|биоревит|лифтинг|шлифовк|чистк|омоложен|подтяжк|пирсинг|коррекц|лисс/i,
    id: "cosmetology",
    icon: "cosmetology",
    name: "Косметология",
  },
  {
    test: /массаж|физиот|реабил|эвлк|лимфодренаж/i,
    id: "physiotherapy",
    icon: "physiotherapy",
    name: "Физиотерапия",
  },
  {
    test: /медосмотр|профосмотр|чекап|чек-ап|осмотр/i,
    id: "checkups",
    icon: "checkups",
    name: "Чекапы и медосмотры",
  },
  {
    test: /справк|водительск|госслужб|086|001-гс/i,
    id: "certificates",
    icon: "certificates",
    name: "Справки",
  },
  {
    test: /сертификат/i,
    id: "certificates-gift",
    icon: "certificates-gift",
    name: "Подарочные сертификаты",
  },
  {
    test: /оптик|очки|линз|оправ|чулк|ремонт|спираль|товар|аксессуар|компрессионн/i,
    id: "optics",
    icon: "optics",
    name: "Оптика и товары",
  },
];

function categorize(service: ApiService): {
  id: string;
  name: string;
  icon: string;
} {
  const text = `${service.group_name || ""} ${service.name || ""} ${service.altname || ""}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(text))
      return { id: rule.id, name: rule.name, icon: rule.icon };
  }
  return { id: OTHER_CATEGORY_ID, name: "Другие услуги", icon: "other" };
}

function buildCategories(services: ApiService[]): PriceCategory[] {
  const byCategory = new Map<string, Map<string, ApiService[]>>();

  for (const s of services) {
    const cat = categorize(s);
    if (!byCategory.has(cat.id)) {
      byCategory.set(cat.id, new Map());
    }
    const groups = byCategory.get(cat.id);
    if (!groups) continue;
    const groupName = s.group_name || "";
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)?.push(s);
  }

  const result: PriceCategory[] = [];
  // Категории в порядке CATEGORY_RULES, «Другие услуги» — в конце
  for (const rule of CATEGORY_RULES) {
    const groups = byCategory.get(rule.id);
    if (!groups) continue;
    result.push(packCategory(rule.id, rule.name, rule.icon, groups));
  }
  const other = byCategory.get(OTHER_CATEGORY_ID);
  if (other) {
    result.push(
      packCategory(OTHER_CATEGORY_ID, "Другие услуги", "other", other),
    );
  }
  return result;
}

function packCategory(
  id: string,
  name: string,
  icon: string,
  groups: Map<string, ApiService[]>,
): PriceCategory {
  const subgroups: PriceSubgroup[] = [...groups.entries()]
    .map(([gName, list]) => ({
      name: gName,
      services: [...list].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  return {
    id,
    name,
    icon: <CategoryIcon d={ICON_PATHS[icon] ?? ICON_PATHS.other} />,
    subgroups,
    count: subgroups.reduce((sum, g) => sum + g.services.length, 0),
  };
}

export default function PriceListPage() {
  const seoData = {
    title: "Прайс-лист на медицинские услуги клиники Алдан",
    description:
      "Актуальные цены на все медицинские услуги клиники Алдан. Лабораторные исследования, УЗИ, консультации специалистов, диагностика и лечение. Прозрачное ценообразование.",
    canonical: "/prices",
    ogType: "website" as const,
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Полный прайс: archimedService сам выбирает формат
        // (группированный ответ нового бэкенда или постраничную загрузку старого).
        const all = await archimedService.getServices();
        setCategories(buildCategories(all));
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить прайс-лист. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Поиск фильтрует услуги, пустые подкатегории и категории скрываются
  const filteredCategories = useMemo(() => {
    const query = normalizeSearch(searchQuery);
    if (!query) return categories;
    const terms = query.split(/\s+/).filter(Boolean);
    const match = (s: ApiService) => {
      const haystack = normalizeSearch(
        `${s.name} ${s.altname || ""} ${s.group_name || ""}`,
      );
      // Каждое слово запроса должно встретиться (порядок не важен)
      return terms.every((t) => haystack.includes(t));
    };

    return categories
      .map((c) => ({
        ...c,
        subgroups: c.subgroups
          .map((g) => ({ ...g, services: g.services.filter(match) }))
          .filter((g) => g.services.length > 0),
      }))
      .map((c) => ({
        ...c,
        count: c.subgroups.reduce((s, g) => s + g.services.length, 0),
      }))
      .filter((c) => c.subgroups.length > 0);
  }, [categories, searchQuery]);

  const visibleCategories =
    selectedCategory === "all"
      ? filteredCategories
      : filteredCategories.filter((c) => c.id === selectedCategory);

  const totalServices = useMemo(
    () => categories.reduce((sum, c) => sum + c.count, 0),
    [categories],
  );

  // Постраничный вывод: одна категория за раз, внутри неё услуги по PAGE_SIZE.
  // При «Все услуги» показываем список категорий-ссылок вместо простыни.
  const PAGE_SIZE = 100;

  const activeCategory =
    selectedCategory === "all" ? null : (visibleCategories[0] ?? null);

  const pagedSubgroups = useMemo(() => {
    if (!activeCategory) return [];
    let remaining = (page - 1) * PAGE_SIZE;
    const result: Array<{ group: PriceSubgroup; slice: ApiService[] }> = [];
    for (const g of activeCategory.subgroups) {
      if (remaining >= g.services.length) {
        remaining -= g.services.length;
        continue;
      }
      const take = Math.min(PAGE_SIZE, g.services.length - remaining);
      result.push({
        group: g,
        slice: g.services.slice(remaining, remaining + take),
      });
      remaining = 0;
      if (result.reduce((sum, r) => sum + r.slice.length, 0) >= PAGE_SIZE)
        break;
    }
    return result;
  }, [activeCategory, page]);

  const totalPages = activeCategory
    ? Math.max(1, Math.ceil(activeCategory.count / PAGE_SIZE))
    : 0;

  // Сброс страницы при смене категории или поискового запроса
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  const goToPage = (p: number) => {
    setPage(p);
    document
      .getElementById("price-categories")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ServiceRow = ({ service }: { service: ApiService }) => {
    const price = getServicePrice(service);
    return (
      <div className="flex items-baseline justify-between gap-3 py-2">
        <div className="text-gray-900 text-sm sm:text-base leading-snug min-w-0">
          {service.name}
        </div>
        <div className="shrink-0 text-primary font-semibold text-xs sm:text-sm whitespace-nowrap">
          {price > 0 ? `${price.toLocaleString("ru-RU")} ₽` : "Цена уточняется"}
        </div>
      </div>
    );
  };

  return (
    <>
      <SeoHead pageData={seoData} />
      <SchemaOrg
        pageName="Прайс-лист клиники Алдан"
        pageDescription="Актуальные цены на все медицинские услуги клиники Алдан"
        pageUrl="https://clinicaldan.ru/prices"
        breadcrumbs={[
          { name: "Главная", url: "https://clinicaldan.ru/" },
          { name: "Прайс-лист", url: "https://clinicaldan.ru/prices" },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
        {/* Hero */}
        <section
          className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
          style={{ backgroundImage: "url(/bg-hero.jpg)" }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              Прайс-лист
            </h1>
            <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
              Актуальные цены на все услуги клиники. Найдите нужную услугу через
              поиск или выберите категорию.
            </p>
          </div>
        </section>

        {/* Поиск */}
        <section className="py-6 sm:py-8 bg-white border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск услуги..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 pl-12 sm:pl-14 pr-4 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <svg
                  className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                )}
              </div>
              {!isLoading && !error && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
                  Категорий: {categories.length} · Услуг: {totalServices}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Прайс по категориям */}
        <section
          id="price-categories"
          className="py-8 sm:py-10 md:py-12 bg-gray-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 max-w-5xl mx-auto">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-600 text-sm sm:text-base">
                  Загрузка прайс-листа…
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm sm:text-base mb-6">
                  Прайс-лист временно недоступен.
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
            ) : (
              <div className="max-w-5xl mx-auto">
                {/* Фильтр по категориям */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedCategory === "all"
                          ? "bg-primary text-white shadow-md scale-105"
                          : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200"
                      }`}
                    >
                      Все услуги
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id)}
                        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          selectedCategory === c.id
                            ? "bg-primary text-white shadow-md scale-105"
                            : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200"
                        }`}
                      >
                        <span className="text-primary [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5 flex items-center [&>svg]:shrink-0 [&>svg]:transition-colors">
                          {c.icon}
                        </span>
                        <span className="whitespace-nowrap">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {visibleCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-sm sm:text-base">
                      По вашему запросу ничего не найдено.
                    </p>
                  </div>
                ) : selectedCategory === "all" ? (
                  /* Обзор всех категорий: компактный список-меню */
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {visibleCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 [&>svg]:h-5 [&>svg]:w-5">
                          {category.icon}
                        </span>
                        <span className="flex-grow min-w-0">
                          <span className="block text-sm sm:text-base font-medium text-gray-900 truncate">
                            {category.name}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {category.count} услуг
                          </span>
                        </span>
                        <svg
                          className="w-5 h-5 text-gray-400 shrink-0"
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
                      </button>
                    ))}
                  </div>
                ) : (
                  activeCategory && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <span className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary shrink-0 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                            {activeCategory.icon}
                          </span>
                          <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                              {activeCategory.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {activeCategory.count} услуг
                            </p>
                          </div>
                        </div>

                        {pagedSubgroups.map(({ group, slice }) => (
                          <div key={group.name} className="mb-6 last:mb-0">
                            {group.name && pagedSubgroups.length > 0 && (
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-100">
                                {group.name}
                                <span className="text-xs sm:text-sm text-gray-500 font-normal ml-2">
                                  {group.services.length}
                                </span>
                              </h3>
                            )}
                            <div className="divide-y divide-gray-100">
                              {slice.map((s) => (
                                <ServiceRow key={s.id} service={s} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Пагинация */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                          <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            ← Назад
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (p) =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - page) <= 1,
                            )
                            .map((p, idx, arr) => (
                              <span
                                key={p}
                                className="flex items-center gap-1 sm:gap-2"
                              >
                                {idx > 0 && arr[idx - 1] < p - 1 && (
                                  <span className="text-gray-400 px-1">…</span>
                                )}
                                <button
                                  onClick={() => goToPage(p)}
                                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                    p === page
                                      ? "bg-primary text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  {p}
                                </button>
                              </span>
                            ))}
                          <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Вперёд →
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
