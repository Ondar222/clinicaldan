import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Testimonial {
  id: number;
  text: string;
  author: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Хочу выразить огромную благодарность врачам клиники Алдан! Очень профессиональные специалисты, внимательное отношение и современное оборудование. Всегда получаю квалифицированную помощь и подробные консультации по всем вопросам здоровья.",
    author: "Ай-Кыс",
    date: "15.03.2025",
  },
  {
    id: 2,
    text: "Обращаюсь в клинику Aлдан уже несколько лет и всегда доволен обслуживанием. Врачи действительно заинтересованы в том, чтобы помочь, а не просто формально провести прием. Особенно радует возможность сдать анализы и пройти все необходимые процедуры в одном месте.",
    author: "Белек",
    date: "02.11.2025",
  },
  {
    id: 3,
    text: "Посетила врача-кардиолога. Прием длился более часа, все подробно расспросили, тщательно обследовали, сделали ЭКГ. Получила детальное объяснение моего состояния и четкий план лечения. Спасибо за внимательное отношение!",
    author: "Екатерина",
    date: "24.05.2025",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragState, setDragState] = useState<{
    startX: number;
    currentX: number;
    isDragging: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  }, []);

  // Автосмена: интервал стабильный, состояние обновляется функционально
  useEffect(() => {
    if (isPaused || testimonials.length < 2) return;
    const id = window.setInterval(goToNext, 800);
    return () => window.clearInterval(id);
  }, [isPaused, goToNext]);

  // Свайп мышью/тачем
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragState({
      startX: e.clientX,
      currentX: e.clientX,
      isDragging: true,
    });
    setIsPaused(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState?.isDragging) return;
      setDragState((prev) => (prev ? { ...prev, currentX: e.clientX } : prev));
    },
    [dragState],
  );

  const handlePointerUp = useCallback(() => {
    if (!dragState) return;
    const diff = dragState.currentX - dragState.startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPrev();
      else goToNext();
    }
    setDragState(null);
    setIsPaused(false);
  }, [dragState, goToNext, goToPrev]);

  const dragOffset = dragState?.isDragging
    ? (dragState.currentX - dragState.startX) * 0.3
    : 0;

  return (
    <section
      className="py-6 sm:py-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), url('/bg_8.avif')`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-white">
          Отзывы пациентов
        </h2>

        <div
          ref={containerRef}
          className="max-w-3xl mx-auto relative touch-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setDragState(null);
          }}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Card with slide animation */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 border border-white/20 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${dragOffset}px)`,
            }}
          >
            <div className="flex justify-center mb-3 sm:mb-4">
              <svg
                className="text-teal h-6 w-6 sm:h-8 sm:w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            <div
              key={testimonials[activeIndex].id}
              className="overflow-hidden animate-fadeIn"
            >
              <p className="text-sm sm:text-base text-center mb-3 sm:mb-4 leading-relaxed">
                {testimonials[activeIndex].text}
              </p>
              <div className="text-center">
                <p className="font-bold text-dark text-sm sm:text-base">
                  {testimonials[activeIndex].author}
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {testimonials[activeIndex].date}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            className="absolute top-1/2 -left-1 sm:-left-2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg text-gray-600 hover:text-primary hover:bg-white transition-all duration-200 transform hover:scale-105"
            onClick={goToPrev}
            aria-label="Предыдущий отзыв"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-4 sm:w-4"
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
            className="absolute top-1/2 -right-1 sm:-right-2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg text-gray-600 hover:text-primary hover:bg-white transition-all duration-200 transform hover:scale-105"
            onClick={goToNext}
            aria-label="Следующий отзыв"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 sm:h-4 sm:w-4"
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

          {/* Indicators */}
          <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
            {testimonials.map((testimonial) => (
              <button
                key={`testimonial-indicator-${testimonial.id}`}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                  testimonials.indexOf(testimonial) === activeIndex
                    ? "bg-primary scale-110"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() =>
                  setActiveIndex(testimonials.indexOf(testimonial))
                }
                aria-label={`Отзыв ${testimonials.indexOf(testimonial) + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View all reviews button */}
        <div className="text-center mt-4 sm:mt-6">
          <a
            href="/reviews/"
            className="inline-block bg-white/90 backdrop-blur-sm border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 font-semibold py-1.5 px-4 sm:py-2 sm:px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-xs sm:text-sm"
          >
            Все отзывы
          </a>
        </div>
      </div>
    </section>
  );
}
