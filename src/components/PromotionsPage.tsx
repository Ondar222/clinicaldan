import React, { useEffect, useMemo, useState } from "react";
import directusService from "../services/directus";
import type { Promotion as CmsPromotion } from "../types/cms";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<CmsPromotion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await directusService.getPromotions();
        setPromotions(res.data || []);
      } catch (e) {
        console.error("Failed to load promotions from Directus", e);
        // setError('Не удалось загрузить акции. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getImageUrl = (image?: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    // В production используем HTTPS по умолчанию, если переменная окружения не задана
    const base = (
      import.meta.env.VITE_DIRECTUS_URL ||
      (import.meta.env.PROD
        ? "https://clinicaldan.ru/api/directus"
        : "http://localhost:8055")
    ).replace(/\/$/, "");
    return `${base}/assets/${image}`;
  };

  const uiPromos = useMemo(() => {
    return promotions.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      discountLabel:
        typeof p.discount === "number" && p.discount > 0
          ? `${p.discount}%`
          : "Акция",
      validUntil: p.valid_until,
      imageUrl: getImageUrl(p.image),
    }));
  }, [promotions]);

  const listToRender = useMemo(() => {
    if (uiPromos.length > 0) return uiPromos;
    // Fallback to VK promo when Directus is unavailable
    return [
      {
        id: "vk-7248",
        title: "На все операции по варикозу -30%",
        description:
          "Если симптомы варикозного расширения вен проявились у вас в сентябре или октябре, клиника «Алдан» дарит специальную скидку 30% на курс лечения. Для получения более подробной информации и записи на консультацию к флебологу звоните по указанному номеру телефона в контактах.",
        discountLabel: "Акция",
        validUntil: "",
        imageUrl: "/www.jpg",
        link: "https://vk.com/wall-128344113_7248",
        isVideo: true,
      } as any,
    ];
  }, [uiPromos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
            Акции и специальные предложения
          </h1>

          {isLoading && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              Загрузка...
            </div>
          )}
          {error && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-red-600">
              {error}
            </div>
          )}

          {!isLoading &&
            (isMobile ? (
              <div className="space-y-4">
                {listToRender.map((promo: any) => {
                  const key = String(promo.id);
                  const isOpen = !!expanded[key];
                  return (
                    <div
                      key={promo.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className="w-full flex items-center justify-between p-4"
                        aria-expanded={isOpen}
                        aria-controls={`promo-body-${key}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-teal text-white px-3 py-1 rounded-full text-sm font-medium">
                            {promo.discountLabel}
                          </span>
                          <h3 className="text-base font-semibold text-gray-900 text-left">
                            {promo.title}
                          </h3>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isOpen && (
                        <div
                          id={`promo-body-${key}`}
                          className="border-t border-gray-200"
                        >
                          {promo.imageUrl && (
                            <div className="relative w-full pt-[100%]">
                              <img
                                src={promo.imageUrl}
                                alt={promo.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  const fallback =
                                    "https://copyblank.ru/upload/iblock/6ab/6ab1bfd9b03a0b0f7f5ae8b7e9fee88d.webp";
                                  if (e.currentTarget.src !== fallback)
                                    e.currentTarget.src = fallback;
                                }}
                              />
                              {promo.isVideo && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    promo.link &&
                                    window.open(
                                      promo.link,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center group"
                                  aria-label="Смотреть видео ВКонтакте"
                                >
                                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90 text-[#2a5885] group-hover:bg-white transition">
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                          <div className="p-4">
                            <p className="text-gray-600 mb-3 leading-relaxed">
                              {promo.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {promo.validUntil
                                  ? `Действует до: ${promo.validUntil}`
                                  : ""}
                              </span>
                              {promo.link ? (
                                <a
                                  href={promo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-teal text-white px-4 py-2 rounded-md font-medium hover:bg-teal/90 transition-colors"
                                >
                                  {promo.isVideo
                                    ? "Смотреть видео"
                                    : "Подробнее"}
                                </a>
                              ) : (
                                <button className="bg-teal text-white px-4 py-2 rounded-md font-medium hover:bg-teal/90 transition-colors">
                                  Записаться
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listToRender.map((promo: any) => (
                  <div
                    key={promo.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
                  >
                    {promo.isVideo ? (
                      <div className="relative w-full pt-[100%]">
                        {promo.imageUrl ? (
                          <img
                            src={promo.imageUrl}
                            alt={promo.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              const fallback =
                                "https://copyblank.ru/upload/iblock/6ab/6ab1bfd9b03a0b0f7f5ae8b7e9fee88d.webp";
                              if (e.currentTarget.src !== fallback)
                                e.currentTarget.src = fallback;
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#4c75a3] to-[#2a5885]" />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            promo.link &&
                            window.open(
                              promo.link,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="absolute inset-0 flex items-center justify-center group"
                          aria-label="Смотреть видео ВКонтакте"
                        >
                          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 text-[#2a5885] group-hover:bg-white transition">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </button>
                        <div className="absolute top-4 right-4 bg-teal text-white px-3 py-1 rounded-full font-medium">
                          {promo.discountLabel}
                        </div>
                      </div>
                    ) : promo.imageUrl ? (
                      <div className="relative">
                        <img
                          src={promo.imageUrl}
                          alt={promo.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-teal text-white px-3 py-1 rounded-full font-medium">
                          {promo.discountLabel}
                        </div>
                      </div>
                    ) : null}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-tight">
                        {promo.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                        {promo.description}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {promo.validUntil
                              ? `Действует до: ${promo.validUntil}`
                              : ""}
                          </span>
                          {promo.link ? (
                            <a
                              href={promo.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-teal/90 transition-colors"
                            >
                              {promo.isVideo ? "Смотреть видео" : "Подробнее"}
                            </a>
                          ) : (
                            <button className="bg-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-teal/90 transition-colors">
                              Записаться
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {/* Subscription form */}
          <div className="mt-10 md:mt-12 bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-3 md:mb-4">
              Подпишитесь на рассылку акций
            </h2>
            <p className="text-gray-600 text-center mb-4 md:mb-6">
              Будьте в курсе всех специальных предложений и акций нашей клиники
            </p>
            <form className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal"
                />
                <button
                  type="submit"
                  className="bg-teal text-white px-6 py-2 rounded-md font-medium hover:bg-teal/90 transition-colors"
                >
                  Подписаться
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
