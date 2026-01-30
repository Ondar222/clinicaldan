import React from "react";
import { Link, useParams } from "react-router-dom";
import { tools } from "../data/tools";
import ErrorComponent from "./ErrorComponent";

export default function ToolDetailsPage() {
  const params = useParams();
  const id = Number(params.id);
  const tool = tools.find((t) => t.id === id);

  if (!tool) {
    return (
      <ErrorComponent
        title="Инструмент не найден"
        message="К сожалению, мы не нашли такой инструмент. Вернитесь на главную страницу и попробуйте снова."
      />
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="mb-4">
          <Link
            to="/#tools"
            className="inline-flex items-center text-primary hover:text-primaryDark text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Назад
          </Link>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5] overflow-hidden">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-dark">
              {tool.title}
            </h1>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {tool.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
