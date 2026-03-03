import useSWR from 'swr';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Backend API URL - relative path so Vite proxy (dev) or nginx (prod) handles it
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// VK API - fetch directly from VK through backend proxy
const VK_API_URL = '/api/vk';

const fetcher = async (url: string) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch' }));
    throw new Error(error.error || error.message || 'Failed to fetch');
  }
  return response.json();
};

const vkFetcher = async (url: string) => {
  const fullUrl = `${VK_API_URL}${url}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch' }));
    throw new Error(error.error || error.message || 'Failed to fetch');
  }
  return response.json();
};

interface VkPost {
  id: number;
  text: string;
  date: number;
  likes?: { count: number };
  comments?: { count: number };
  reposts?: { count: number };
  views?: { count: number };
  attachments?: Array<{
    type: string;
    photo?: {
      sizes: Array<{
        url: string;
        width: number;
        height: number;
      }>;
      image?: string;
    };
    video?: {
      id?: number;
      title: string;
      description?: string;
      image?: Array<{ url: string }>;
      player?: string;
      link?: string;
    };
    link?: {
      url: string;
      title: string;
      description?: string;
      image?: Array<{ url: string }>;
    };
    doc?: {
      title: string;
      url: string;
    };
  }>;
}

interface VkPostsResponse {
  /** Бэкенд отдаёт { items, count } или при ошибке { items: [], count: 0, error } */
  items?: VkPost[];
  count?: number;
  error?: string;
  success?: boolean;
  data?: {
    posts?: VkPost[];
    total?: number;
    items?: VkPost[];
  };
}

interface VkNewsWidgetProps {
  count?: number;
  itemsPerPage?: number;
}

// Компонент карусели медиа
function MediaCarousel({ attachments, postId }: { attachments?: VkPost['attachments'], postId: number }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  const mediaItems = attachments.filter(att =>
    ['photo', 'video', 'link'].includes(att.type)
  );

  if (mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];
  const hasMultiple = mediaItems.length > 1;

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(i => (i + 1) % mediaItems.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(i => (i - 1 + mediaItems.length) % mediaItems.length);
  };

  const renderMedia = (media: typeof currentMedia) => {
    if (!media) return null;

    switch (media.type) {
      case 'photo': {
        const sizes = media.photo?.sizes || [];
        const largestImage = sizes.length > 0
          ? [...sizes].sort((a, b) => b.width - a.width)[0].url
          : media.photo?.image;

        if (!largestImage) return null;

        return (
          <div className="photo-container relative overflow-hidden rounded-lg">
            <img
              src={largestImage}
              alt="Фото"
              className="w-full h-56 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
              loading="lazy"
              onClick={() => navigate(`/vk-post/${postId}`)}
              onError={(e) => {
                (e.target as HTMLImageElement).closest('.photo-container')?.remove();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
              <span className="text-white text-sm font-medium">Посмотреть пост</span>
            </div>
          </div>
        );
      }

      case 'video': {
        const videoData = media.video;
        if (!videoData) return null;

        const thumbnail = videoData.image?.[0]?.url;

        return (
          <a
            href={videoData.link || videoData.player || `https://vk.com/video-${128344113}_${videoData.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/vk-post/${postId}`);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-primary ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={videoData.title}
                className="w-full h-56 object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-56 bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center">
                <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-2.19 0-3.8-.16-4.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L5 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c2.19 0 3.8.16 4.83.44.9.25 1.48.83 1.73 1.73z"/>
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
              <span className="text-white text-sm font-medium">Посмотреть пост</span>
            </div>
          </a>
        );
      }

      case 'link': {
        const linkData = media.link;
        if (!linkData) return null;

        const imageUrl = linkData.image?.[0]?.url;

        return (
          <a
            href={linkData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={linkData.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                  </svg>
                  <p className="text-xs text-gray-500">Ссылка</p>
                </div>
              </div>
            )}
            <div className="p-3 bg-gray-50">
              <p className="text-blue-600 text-xs font-medium line-clamp-2">
                {linkData.title}
              </p>
              {linkData.description && (
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {linkData.description}
                </p>
              )}
            </div>
          </a>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="relative mb-3">
      {/* Media */}
      <div onClick={() => navigate(`/vk-post/${postId}`)} className="cursor-pointer">
        {renderMedia(currentMedia)}
      </div>

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </>
      )}

      {/* Dots indicator */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {mediaItems.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VkNewsWidget({ count = 50, itemsPerPage = 6 }: VkNewsWidgetProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR<VkPostsResponse>(
    `/api/vk/posts?count=${count}&offset=0`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-600 text-sm">Ошибка: {error.message}</p>
        <button
          onClick={() => mutate()}
          className="mt-2 px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Загрузка...</p>
      </div>
    );
  }

  // Бэкенд отдаёт { items, count } или при ошибке { items: [], count: 0, error?: string }
  const posts = data?.data?.items || data?.data?.posts || data?.items || [];
  const backendError = data?.error;

  if (!posts || posts.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 space-y-2">
        <p className="text-sm">Нет новостей</p>
        {backendError && (
          <p className="text-xs text-amber-600 max-w-md mx-auto">
            {backendError}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Проверьте VK_API_TOKEN и VK_OWNER_ID в .env или .back.env на бэкенде.
        </p>
        <button
          type="button"
          onClick={() => mutate()}
          className="text-xs text-blue-600 hover:underline"
        >
          Повторить
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil((posts?.length || 0) / itemsPerPage);
  const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-primary">
            Новости
          </h2>
          <p className="text-xs text-gray-500">
            Страница {currentPage} из {totalPages}
          </p>
        </div>
    
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentPosts.map((post: VkPost) => {
          const text = stripHtml(post.text);
          const hasMedia = post.attachments && post.attachments.some((att: any) =>
            ['photo', 'video', 'link'].includes(att.type)
          );

          return (
            <article
              key={post.id}
              onClick={() => navigate(`/vk-post/${post.id}`)}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-full group"
            >
              <div className="flex flex-col flex-1 p-3">
                {/* Text */}
                {text && (
                  <div className="mb-3 min-h-[3.5rem]">
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
                      {text}
                    </p>
                  </div>
                )}
                
                {!text && <div className="mb-3 min-h-[3.5rem]" />}

                {/* Media Carousel */}
                {hasMedia && (
                  <MediaCarousel
                    attachments={post.attachments}
                    postId={post.id}
                  />
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">
                    {formatDate(post.date)}
                  </span>

                  <div className="flex items-center gap-2">
                    {post.likes && post.likes.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary px-1.5 py-0.5 rounded-full bg-red-50">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="font-medium">{post.likes.count}</span>
                      </span>
                    )}
                    {post.comments && post.comments.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 px-1.5 py-0.5 rounded-full bg-blue-50">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                        <span className="font-medium">{post.comments.count}</span>
                      </span>
                    )}
                    {post.views && post.views.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 px-1.5 py-0.5 rounded-full bg-gray-50">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        <span className="font-medium">{post.views.count}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
          >
            ← Назад
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (page === 1 || page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-sm font-semibold rounded-lg transition-all ${
                      page === currentPage
                        ? 'bg-primary text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-400">...</span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
