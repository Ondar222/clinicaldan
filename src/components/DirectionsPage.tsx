import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import archimedService from "../services/archimed";
import {
  DIRECTIONS,
  type DirectionConfig,
  keywordMatch,
} from "../services/directions";
import type { ApiService } from "../types/cms";
import ServiceGrid from "./ServiceGrid";

function getServicePrice(service: ApiService): number {
  return service.cito_cost > 0 ? service.cito_cost : service.base_cost;
}

function getServicesForDirection(
  allServices: ApiService[],
  direction: DirectionConfig,
): ApiService[] {
  return allServices.filter(
    (s) =>
      keywordMatch(s.group_name, direction.serviceKeywords) ||
      keywordMatch(s.name, direction.serviceKeywords) ||
      keywordMatch(s.altname, direction.serviceKeywords),
  );
}

export default function DirectionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Направления | Клиника Алдан";
    return () => {
      document.title = "Клиника Алдан";
    };
  }, []);

  useEffect(() => {
    const cached = archimedService.getServicesCache();
    if (cached?.length) {
      setServices(cached);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const all = await archimedService.getServices();
        setServices(all);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить услуги. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const servicesByDirection = useMemo(() => {
    const map = new Map<string, ApiService[]>();
    for (const d of DIRECTIONS) {
      map.set(d.slug, getServicesForDirection(services, d));
    }
    return map;
  }, [services]);

  const filteredDirections = useMemo(() => {
    if (!searchQuery.trim()) return DIRECTIONS;
    const query = searchQuery.toLowerCase().trim();
    return DIRECTIONS.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)),
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg-hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Направления
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Выберите интересующее направление и посмотрите описание и услуги.
          </p>
        </div>
      </section>

      {/* Directions tiles (same block as on home) */}
      <ServiceGrid />

      {/* Поиск по направлениям */}
      <section className="py-6 sm:py-8 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск направления..."
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
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
              Найдено направлений: {filteredDirections.length}
            </p>
          </div>
        </div>
      </section>

      {/* Directions list with descriptions + services */}
      <section className="py-8 sm:py-10 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Все направления
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {filteredDirections.map((direction) => {
                const isOpen = openSlug === direction.slug;
                const dirServices =
                  servicesByDirection.get(direction.slug) || [];
                const shown = dirServices.slice(0, 12);

                return (
                  <div
                    key={direction.slug}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSlug((prev) =>
                          prev === direction.slug ? null : direction.slug,
                        )
                      }
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="pr-4">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                          {direction.title}
                        </h3>
                        {direction.description && (
                          <p className="text-gray-600 mt-1 text-xs sm:text-sm leading-relaxed line-clamp-2">
                            {direction.description}
                          </p>
                        )}
                      </div>
                      <span className="text-primary font-bold text-xl">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        {direction.description && (
                          <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              {direction.description}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 sm:mt-5">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                              Услуги
                            </h4>
                            <Link
                              to={`/services/${direction.slug}`}
                              className="text-primary hover:text-primaryDark text-xs sm:text-sm font-medium"
                            >
                              Подробнее →
                            </Link>
                          </div>

                          {isLoading ? (
                            <div className="text-gray-600 text-sm">
                              Загрузка услуг…
                            </div>
                          ) : dirServices.length === 0 ? (
                            <div className="text-gray-600 text-sm">
                              Услуги по этому направлению скоро появятся.
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {shown.map((s) => {
                                  const price = getServicePrice(s);
                                  const priceText =
                                    price && price > 0
                                      ? `${price.toLocaleString("ru-RU")} ₽`
                                      : "Цена уточняется";

                                  return (
                                    <div
                                      key={s.id}
                                      className="flex items-start justify-between gap-3 bg-white border border-gray-100 rounded-lg p-3"
                                    >
                                      <div className="min-w-0">
                                        <div className="text-gray-900 text-sm sm:text-base leading-snug">
                                          {s.name}
                                        </div>
                                        {s.altname && s.altname !== s.name && (
                                          <div className="text-gray-500 text-xs sm:text-sm italic mt-0.5 line-clamp-2">
                                            {s.altname}
                                          </div>
                                        )}
                                      </div>
                                      <div className="shrink-0 text-primary font-semibold text-xs sm:text-sm whitespace-nowrap">
                                        {priceText}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-gray-600 text-xs sm:text-sm">
                                  Показано: {shown.length} из{" "}
                                  {dirServices.length}
                                </div>
                                <Link
                                  to={`/services/${direction.slug}`}
                                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-xs sm:text-sm font-medium"
                                >
                                  Все услуги направления
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
