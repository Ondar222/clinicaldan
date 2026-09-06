import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import archimedService from "../services/archimed";
import type { ApiService } from "../types/cms";
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

// Иконки в стиле Heroicons (outline, 24x24) — как в остальной вёрстке сайта
function CategoryIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? "h-5 w-5 sm:h-6 sm:w-6"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICON_PATHS: Record<string, string> = {
  laboratory:
    "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  ultrasound:
    "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  xray: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  functional:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  endoscopy:
    "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  surgery:
    "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z",
  consultations:
    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  cosmetology:
    "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
  physiotherapy: "M3.75 13l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  checkups:
    "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  certificates: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "certificates-gift":
    "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  optics:
    "M2.243 7.807l2.299 2.299a6 6 0 108.403 8.403l2.298 2.299M2.243 7.807a6.002 6.002 0 018.404-8.404M2.243 7.807L4.5 10.064m14.25 1.542l2.298 2.299a6 6 0 11-8.403 8.403m8.403-8.404a6.002 6.002 0 00-8.404-8.404m8.404 8.404L19.5 13.936",
  other:
    "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437",
};

// Категоризация: сперва по группе Archimed (group_name), затем по ключевым словам
// названия услуги. Всё, что не подошло — «Другие услуги».
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
    const query = searchQuery.toLowerCase().trim();
    if (!query) return categories;
    const match = (s: ApiService) =>
      s.name.toLowerCase().includes(query) ||
      (s.altname || "").toLowerCase().includes(query);

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
      <div className="min-h-screen bg-gray-50">
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
        <section className="py-8 sm:py-10 md:py-12 bg-gray-50">
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
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    {visibleCategories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <span className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary shrink-0 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                            {category.icon}
                          </span>
                          <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                              {category.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {category.count} услуг
                            </p>
                          </div>
                        </div>

                        {category.subgroups.map((g) => (
                          <div key={g.name} className="mb-6 last:mb-0">
                            {g.name && category.subgroups.length > 1 && (
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-100">
                                {g.name}
                                <span className="text-xs sm:text-sm text-gray-500 font-normal ml-2">
                                  {g.services.length}
                                </span>
                              </h3>
                            )}
                            <div className="divide-y divide-gray-100">
                              {g.services.map((s) => (
                                <ServiceRow key={s.id} service={s} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
