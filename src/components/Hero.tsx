import { useState, useEffect } from "react";
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
    image: "/bg-hero.jpg",
  },
  {
    id: 2,
    title: "Комплексные программы обследования",
    subtitle: "Полная диагностика за один день",
    description:
      "Современные программы комплексного обследования организма позволяют выявить заболевания на ранних стадиях и предотвратить их развитие. Индивидуальный подход к каждому пациенту.",
    buttonText: "ПОДРОБНЕЕ",
    buttonLink: "/prices",
    image: "/bg-hero.jpg",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSlideChange((currentSlide + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleSlideChange = (index: number) => {
    if (isAnimating || index === currentSlide) return;

    setIsAnimating(true);
    setCurrentSlide(index);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const nextSlide = () => {
    handleSlideChange((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    handleSlideChange(
      currentSlide === 0 ? slides.length - 1 : currentSlide - 1
    );
  };

  return (
    <section className="relative h-[400px] sm:h-[450px] md:h-[400px] overflow-hidden">
      {/* Slides container */}
      <div
        className="h-full relative"
        style={{
          transition: "background-image 0.6s ease-in-out",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url(${slides[currentSlide].image})`,
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
            <div className="container mx-auto h-full flex items-center">
              <div className="max-w-3xl text-white px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl">
                <h2
                  className="text-lg sm:text-xl md:text-2xl font-medium mb-1 animate-fadeInUp opacity-0"
                  style={{
                    animationDelay: "0.1s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.subtitle}
                </h2>
                <h1
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 animate-fadeInUp opacity-0"
                  style={{
                    animationDelay: "0.3s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 animate-fadeInUp opacity-0 leading-relaxed"
                  style={{
                    animationDelay: "0.5s",
                    animationFillMode: "forwards",
                  }}
                >
                  {slide.description}
                </p>
                <Link
                  to={slide.buttonLink}
                  className="bg-primary hover:bg-primaryDark transition-colors text-white py-1.5 px-4 sm:py-2 sm:px-6 inline-block font-medium rounded-md animate-fadeInUp opacity-0 shadow-lg text-xs sm:text-sm"
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
        disabled={isAnimating}
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
        disabled={isAnimating}
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
            onClick={() => handleSlideChange(slides.indexOf(slide))}
            disabled={isAnimating}
            aria-label={`Go to slide ${slides.indexOf(slide) + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
