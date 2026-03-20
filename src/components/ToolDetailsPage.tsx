import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { tools } from "../data/tools";
import ErrorComponent from "./ErrorComponent";

export default function ToolDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-primary hover:text-primaryDark text-sm font-medium group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform"
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
          </button>
        </div>

        {/* Tool Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] md:aspect-[16/7] overflow-hidden bg-gray-100">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="p-5 md:p-7 lg:p-9">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                {tool.id}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
                {tool.title}
              </h1>
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
