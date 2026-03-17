import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";
import type { ToolItem } from "../data/tools";

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-dark">
            Наши инструменты
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            В нашей клинике используется современное медицинское оборудование для
            точной диагностики и эффективного лечения.
          </p>
        </div>

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
