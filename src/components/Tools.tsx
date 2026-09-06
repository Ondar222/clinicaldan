import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

export default function Tools() {
  return (
    <section
      id="tools"
      className="py-10 sm:py-14 md:py-16 bg-gradient-to-b from-white via-[#fdf2f4] to-white"
    >
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-[#fdf2f4] text-primary text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-3">
            Технологии
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark mb-3 leading-tight">
            Современное оборудование
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
            В нашей клинике используется{" "}
            <span className="font-medium text-dark">
              передовое медицинское оборудование
            </span>{" "}
            для точной диагностики и эффективного лечения
          </p>
        </div>

        {/* Tools Grid */}
        <div className="relative">
          {/* Мягкие декоративные пятна */}
          <div className="absolute -left-6 top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -right-6 bottom-6 w-28 h-28 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          {/* Mobile: Horizontal scroll */}
          <div className="sm:hidden overflow-x-auto pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-4 w-max">
              {tools.slice(-5).map((tool) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="w-44 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/25"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#fdf2f4]">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-dark leading-snug line-clamp-2 min-h-[2.25rem] group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 relative">
            {tools.slice(-5).map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/25 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#fdf2f4]">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-dark leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <span className="mt-auto pt-2 sm:pt-3 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-primary/80 group-hover:text-primary">
                    Подробнее
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Кнопка «Все инструменты» */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to="/tools"
            className="group inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-primary/25 bg-white text-primary hover:bg-primary hover:text-white hover:border-primary font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Все инструменты
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
