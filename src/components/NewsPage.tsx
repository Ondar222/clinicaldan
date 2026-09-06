import { Link } from "react-router-dom";
import VkNewsWidget from "./VkNewsWidget";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Hero */}
      <section
        className="py-10 sm:py-12 md:py-14 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg-hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3">
            Будьте в курсе
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Новости клиники
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Актуальные новости, акции и события клиники Алдан
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
                Все публикации
              </h2>
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border border-primary/20 bg-white text-primary hover:bg-primary hover:text-white hover:border-primary font-semibold text-xs sm:text-sm transition-all duration-200 shrink-0 shadow-sm"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                На главную
              </Link>
            </div>

            <VkNewsWidget count={12} itemsPerPage={6} />
          </div>
        </div>
      </section>
    </div>
  );
}
