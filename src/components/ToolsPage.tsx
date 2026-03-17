import React from "react";
import { Link } from "react-router-dom";
import { tools } from "../data/tools";
import type { ToolItem } from "../data/tools";

export default function ToolsPage() {
  const [selected, setSelected] = React.useState<ToolItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = (tool: ToolItem) => {
    setSelected(tool);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelected(null), 150);
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    
    // Блокируем скролл фона при открытом модальном окне
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

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
            <div
              key={tool.id}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <button
                  type="button"
                  onClick={() => openModal(tool)}
                  className="w-full py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all text-xs sm:text-sm mt-2"
                >
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-modal-title"
            onClick={closeModal}
          >
            <div
              className="absolute inset-0 bg-black/50"
            />
            <div
              className="relative bg-white w-full max-w-3xl rounded-lg sm:rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Закрыть"
                onClick={closeModal}
                className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full p-1 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="relative aspect-[16/9] sm:aspect-[16/7] overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <h3
                  id="tool-modal-title"
                  className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-dark"
                >
                  {selected.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {selected.description}
                </p>
                <div className="mt-4 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primaryDark text-sm"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
