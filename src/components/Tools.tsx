import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

export default function Tools() {
  return (
    <section id="tools" className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="relative mb-8">
          {/* Decorative Elements */}
          <div className="absolute -left-4 top-0 w-12 h-12 bg-primary/10 rounded-full blur-xl" />
          <div className="absolute -right-4 bottom-0 w-16 h-16 bg-primary/5 rounded-full blur-xl" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
                  Современное оборудование
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
                В нашей клинике используется <span className="font-medium text-dark">передовое медицинское оборудование</span> для точной диагностики и эффективного лечения
              </p>
            </div>
            <Link
              to="/tools"
              className="inline-flex items-center justify-center sm:justify-end text-primary hover:text-primaryDark font-medium text-sm group flex-shrink-0 transition-colors"
            >
              <span className="border-b border-primary/30 group-hover:border-primary transition-colors pb-0.5">
                Все инструменты
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
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

        {/* Tools Grid - Horizontal scroll on mobile, grid on desktop */}
        <div className="mb-8">
          {/* Mobile: Horizontal scroll */}
          <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4 w-max">
              {tools.slice(-5).map((tool, index) => (
                <Link
                  key={tool.id}
                  to={`/tools/${tool.id}`}
                  className="w-40 flex-shrink-0 bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-dark mb-1 line-clamp-2 min-h-[2.5rem]">
                      {tool.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop: Grid layout */}
          <div className="hidden sm:grid grid-cols-5 gap-4">
            {tools.slice(-5).map((tool, index) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-dark mb-1 line-clamp-2 min-h-[2.5rem]">
                    {tool.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
