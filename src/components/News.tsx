import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import vkService, { VKPost } from "../services/vk";

interface NewsProps {
  limit?: number;
  showPagination?: boolean;
}

// lg = 1024px — на десктопе 5 постов, на адаптивной 4
const DESKTOP_BREAKPOINT = 1024;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches : true
  );
  useEffect(() => {
    const m = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => setIsDesktop(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

export default function News({ limit = 5, showPagination = true }: NewsProps) {
  const isDesktop = useIsDesktop();
  const [posts, setPosts] = useState<VKPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const visibleCount = isDesktop ? 5 : 4;
  const visiblePosts = posts.slice(0, visibleCount);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * limit;
        const response = await vkService.getPosts(offset, limit);
        
        // Проверяем наличие ошибки в ответе
        if (response.error) {
          setError(response.error);
          setPosts([]);
          setTotalPosts(0);
        } else {
          setPosts(response.posts || []);
          setTotalPosts(response.total || 0);
        }
      } catch (err: any) {
        console.error("Error loading news:", err);
        const errorMessage = err?.message || "Не удалось загрузить новости. Попробуйте позже.";
        setError(errorMessage);
        setPosts([]);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, limit]);

  const totalPages = Math.ceil(totalPosts / limit);

  if (loading && posts.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-dark">
            Новости
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && posts.length === 0) {
    return (
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark text-center order-2 sm:order-1 flex-1">Новости</h2>
            <Link to="/news" className="text-primary hover:text-primary/80 font-semibold text-sm md:text-base transition-colors flex items-center justify-center gap-2 order-1 sm:order-2">
              Все новости
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="text-center text-red-600 py-6 sm:py-8 text-sm sm:text-base">{error}</div>
        </div>
      </section>
    );
  }

  // Всегда показываем секцию: с постами или заглушкой при пустом списке
  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark">
            Новости
          </h2>
          <Link
            to="/news"
            className="text-primary hover:text-primary/80 font-semibold text-sm sm:text-base transition-colors flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            Все новости
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">
            Пока нет новостей. Загляните на страницу новостей позже.
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 items-stretch">
          {visiblePosts.map((post) => (
            <Link
              key={post.id}
              to={`/vk-post/${post.id}`}
              className="group block h-full min-w-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <article className="h-full flex flex-col min-h-0">
                {post.imageUrl ? (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full bg-gray-50 flex-shrink-0" aria-hidden />
                )}
                <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 block shrink-0">
                    {post.formattedDate || new Date(post.date * 1000).toLocaleDateString('ru-RU')}
                  </span>
                  <p className="text-gray-700 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 flex-1 min-h-[2.5em] sm:min-h-[2.75em]">
                    {vkService.truncateText(post.text, 80)}
                  </p>
                  <span className="text-primary group-hover:text-primary/80 font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors shrink-0">
                    Читать далее
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
        )}

        {showPagination && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[2.25rem] sm:min-w-[2.5rem] px-2 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-white border-primary"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

