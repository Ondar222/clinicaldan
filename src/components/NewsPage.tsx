import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import vkService, { VKPost } from "../services/vk";

export default function NewsPage() {
  const [posts, setPosts] = useState<VKPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedPost, setSelectedPost] = useState<VKPost | null>(null);
  const postsPerPage = 10;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * postsPerPage;
        const response = await vkService.getPosts(offset, postsPerPage);
        
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
  }, [currentPage]);

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-lightTeal py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-lightTeal py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-dark">
            Новости
          </h1>
          <div className="text-center text-red-600 py-8">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightTeal py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-dark">
              Новости клиники
            </h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Следите за актуальными новостями, акциями и событиями клиники Алдан
            </p>
            <div className="text-center mt-4">
              <a
                href="https://vk.com/clinicaaldan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.785 16.241s.327-.039.495-.238c.185-.22.179-.51.179-.51s-.026-3.75 1.676-4.304c1.707-.563 3.9 3.95 6.226 5.696 1.773 1.316 3.115 1.028 3.115 1.028l6.22-.09s3.25-.203 1.71-2.77c-.128-.21-.91-1.88-4.687-5.316-3.966-3.62-3.436-3.036 1.344-9.304.923-1.2.647-1.82-.614-1.82h-6.63s-.49-.035-.855.22c-.298.2-.49.65-.49.65s-.881 2.35-2.054 4.35c-2.476 4.2-3.468 4.95-3.872 4.66-.95-.57-.712-2.3-.712-3.53 0-3.84.558-5.44-1.088-5.86-.275-.07-.477-.12-1.182-.127-.865-.01-1.525.003-1.92.207-.264.135-.475.435-.35.453.155.022.505.097.69.355.24.33.23 1.07.23 1.07s1.38 8.08 3.23 12.15c1.5 3.22 2.23 4.22 3.48 4.22h.84s.99.07 1.19-.64c.09-.36.09-.78.09-1.28 0-2.5.18-3.55.81-3.9.4-.22 1.15-.15 1.9.11.5.18.87.3.96.47.14.24.1.78.1 1.2-.01.8.14 1.13.32 1.3.22.21.48.14.48.14z"/>
                </svg>
                Подписаться на новости в ВКонтакте
              </a>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                {post.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.35-1.88-2.98-3.66-3.21z" />
                      </svg>
                      {post.formattedDate || new Date(post.date * 1000).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2 line-clamp-2">
                    {vkService.truncateText(post.text, 100)}
                  </h3>
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {vkService.truncateText(post.text, 150)}
                  </p>
                  <button className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-2 transition-colors">
                    Читать далее
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-primary text-white border-primary"
                            : "border-gray-300 hover:bg-white"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-2"
                >
                  Вперед
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Страница {currentPage} из {totalPages}
              </div>
            </div>
          )}

          {/* Modal for full post */}
          {selectedPost && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPost(null)}
            >
              <div
                className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-dark">Новость</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  {selectedPost.imageUrl && (
                    <img
                      src={selectedPost.imageUrl}
                      alt=""
                      className="w-full h-auto rounded-lg mb-4"
                    />
                  )}
                  <div className="text-sm text-gray-500 mb-4">
                    {selectedPost.formattedDate || new Date(selectedPost.date * 1000).toLocaleDateString('ru-RU')}
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedPost.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

