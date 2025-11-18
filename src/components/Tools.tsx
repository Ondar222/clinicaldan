import React from "react";
import { tools } from "../data/tools";
import type { ToolItem } from "../data/tools";

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
  const [selected, setSelected] = React.useState<ToolItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const openModal = (tool: ToolItem) => {
    setSelected(tool);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    // slight delay to avoid flicker if CSS transitions are later added
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
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="tools" className="py-6 sm:py-10 bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3 text-dark">
          Наши инструменты
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-6 sm:mb-8 text-xs sm:text-sm">
          В нашей клинике используется современное медицинское оборудование для
          точной диагностики и эффективного лечения.
        </p>

        <div className="relative">
          <div
            ref={scrollerRef}
            className="flex gap-3 sm:gap-4 items-stretch overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
          >
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm overflow-hidden group transition-all duration-200 hover:shadow-md flex flex-col h-full snap-start min-w-[240px] sm:min-w-[260px] md:min-w-[280px]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 sm:p-4 flex flex-col flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-dark">
                    {tool.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => openModal(tool)}
                    className="mt-auto inline-flex items-center text-primary hover:text-primaryDark text-xs sm:text-sm font-medium"
                  >
                    Подробнее
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1"
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
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Прокрутить влево"
            onClick={() => scrollByAmount("left")}
            className="hidden sm:flex absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary border border-primary/20 rounded-full p-1.5 sm:p-2 shadow transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
          </button>
          <button
            type="button"
            aria-label="Прокрутить вправо"
            onClick={() => scrollByAmount("right")}
            className="hidden sm:flex absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-primary border border-primary/20 rounded-full p-1.5 sm:p-2 shadow transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
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
          </button>
        </div>

        {isModalOpen && selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-modal-title"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />
            <div className="relative bg-white w-full max-w-3xl rounded-lg sm:rounded-xl shadow-xl overflow-hidden">
              <button
                type="button"
                aria-label="Закрыть"
                onClick={closeModal}
                className="absolute right-2 top-2 sm:right-3 sm:top-3 text-gray-500 hover:text-gray-700"
              ></button>
              <div className="relative aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full h-full object-scale-down"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3
                  id="tool-modal-title"
                  className="text-lg sm:text-2xl font-bold mb-2 text-dark"
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
    </section>
  );
}
