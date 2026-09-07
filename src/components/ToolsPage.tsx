import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";
import type { ToolItem } from "../data/tools";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] overflow-hidden">
      {/* Мягкие декоративные пятна */}
      <div className="fixed -left-20 top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -right-10 bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 lg:py-20 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg_8.avif)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Наши инструменты
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            В нашей клинике используется современное медицинское оборудование
            для точной диагностики и эффективного лечения.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">
        {/* Tools Grid - All Tools */}

        {/* Tools Grid - All Tools */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {tools.map((tool, index) => (
            <Link
              key={tool.id}
              to={`/tools/${tool.id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-dark flex-1 pr-2 line-clamp-2">
                    {tool.title}
                  </h3>
                  <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs">
                    {tool.id}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3 flex-1">
                  {tool.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center text-primary group-hover:text-primaryDark text-xs sm:text-sm font-semibold">
                    Подробнее
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-4 sm:w-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
