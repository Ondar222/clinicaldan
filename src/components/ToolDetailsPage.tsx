import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
          <div className="inline-block mb-4">
            <svg className="w-10 h-10 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            {tool.title}
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-base">
            Современное оборудование клиники Алдан
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto border border-primary/10">
          <div className="relative aspect-[4/3] md:aspect-[16/7] overflow-hidden bg-gradient-to-br from-[#fdf2f4] to-white">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-contain p-4 md:p-8"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="p-5 md:p-7 lg:p-9">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                {tool.id}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {tool.title}
              </h2>
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
