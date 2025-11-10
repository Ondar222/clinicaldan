import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";

function getHalf(text: string): string {
  if (!text) return "";
  const half = Math.ceil(text.length / 2);
  const slice = text.slice(0, half);
  // Try to end at sentence boundary if present
  const lastDot = slice.lastIndexOf(".");
  const cutoff = lastDot > half * 0.5 ? lastDot + 1 : slice.length;
  const out = slice.slice(0, cutoff).trim();
  return out.endsWith(".") ? out : out + "…";
}

export default function Tools() {
  return (
    <section id="tools" className="py-6 sm:py-10 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3 text-dark">
          Наши инструменты
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-6 sm:mb-8 text-xs sm:text-sm">
          В нашей клинике используется современное медицинское оборудование для
          точной диагностики и эффективного лечения.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm overflow-hidden group transition-all duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-1 text-dark">
                  {tool.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-2">
                  {getHalf(tool.description)}
                </p>
                <Link
                  to={`/tools/${tool.id}`}
                  className="inline-flex items-center text-primary hover:text-primaryDark text-xs sm:text-sm font-medium"
                >
                  Подробнее
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 ml-1"
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
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
