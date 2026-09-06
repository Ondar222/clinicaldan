import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    id: 1,
    title: "Клиника Алдан",
    subtitle: "Современная медицина",
    description:
      "Современная медицинская клиника с высококвалифицированными специалистами. Мы предоставляем полный спектр медицинских услуг с использованием передовых технологий и индивидуальным подходом к каждому пациенту.",
    buttonText: "ПОДРОБНЕЕ",
    buttonLink: "/about",
    // image: "/bg-hero.jpg",
    image: "/bg_8.avif",
  },
  {
    id: 2,
    title: "Комплексные программы обследования",
    subtitle: "Полная диагностика за один день",
    description:
      "Современные программы комплексного обследования организма позволяют выявить заболевания на ранних стадиях и предотвратить их развитие. Индивидуальный подход к каждому пациенту.",
    buttonText: "ПОДРОБНЕЕ",
    buttonLink: "/prices",
    image: "/bg_6.jpeg",
  },
  {
    id: 3,
    title: "Опытные врачи",
    subtitle: "Забота о вашем здоровье",
    description:
      "Более 30 специалистов: кардиологи, неврологи, урологи, гинекологи, врачи УЗИ и другие. Запишитесь на приём онлайн или по телефону — подберём удобное время.",
    buttonText: "НАШИ ВРАЧИ",
    buttonLink: "/doctors",
    image: "/bg_3.png",
  },
  {
    id: 4,
    title: "Направления и услуги",
    subtitle: "Широкий спектр помощи",
    description:
      "От консультаций узких специалистов и лабораторной диагностики до хирургии, косметологии и физиотерапии — всё в одной клинике.",
    buttonText: "ВСЕ НАПРАВЛЕНИЯ",
    buttonLink: "/directions",
    image: "/bg_4.png",
  },
  {
    id: 5,
    title: "Чекапы организма",
    subtitle: "Проверьтесь вовремя",
    description:
      "Готовые комплексные программы: кардиологические, сосудистые, гастро, гинекологические и онкоскрининг. Выявим риски до появления симптомов.",
    buttonText: "ВЫБРАТЬ ЧЕКАП",
    buttonLink: "/checkups",
    image: "/bg_5.png",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrentSlide(((index % slides.length) + slides.length) % slides.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Автосмена слайдов, пауза при наведении
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section
      className="relative h-[400px] sm:h-[450px] md:h-[400px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides container */}
      <div
        className="h-full relative"
        style={{
          transition: "background-image 0.6s ease-in-out",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.2)), url(${slides[currentSlide].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex items-center transition-opacity duration-600 ease-in-out ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="container mx-auto h-full flex items-center px-1.5 sm:px-4">
              <div
                key={`${slide.id}-${index === currentSlide ? "active" : "idle"}`}
                className="max-w-2xl text-white px-2.5 sm:px-5 md:px-6 py-1.5 sm:py-4 md:py-5 bg-black/30 backdrop-blur-[2px] rounded-md sm:rounded-2xl border border-white/20 shadow-2xl"
              >
                <h2
                  className="text-[10px] sm:text-lg md:text-xl font-medium mb-0 animate-fadeInUp opacity-0"
                  style={{
                    animationDelay: "0.1s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.subtitle}
                </h2>
                <h1
                  className="text-[12px] sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-2 animate-fadeInUp opacity-0"
                  style={{
                    animationDelay: "0.3s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-3 animate-fadeInUp opacity-0 leading-snug line-clamp-2 sm:line-clamp-none"
                  style={{
                    animationDelay: "0.5s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="bg-primary hover:bg-primaryDark transition-colors text-white py-[3px] px-2 sm:py-1.5 sm:px-5 inline-block font-medium rounded-md animate-fadeInUp opacity-0 shadow-lg text-[9px] sm:text-xs"
                  style={{
                    animationDelay: "0.7s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1.5 sm:p-2 rounded-full text-white transition-colors z-10 backdrop-blur-sm"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1.5 sm:p-2 rounded-full text-white transition-colors z-10 backdrop-blur-sm"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
        {slides.map((slide) => (
          <button
            key={`slide-indicator-${slide.id}`}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              slides.indexOf(slide) === currentSlide
                ? "bg-primary w-6 sm:w-8"
                : "bg-white/60 hover:bg-white/80"
            }`}
            onClick={() => goTo(slides.indexOf(slide))}
            aria-label={`Go to slide ${slides.indexOf(slide) + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
