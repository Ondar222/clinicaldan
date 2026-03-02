import useSWR from 'swr';
import { useState } from 'react';

// Backend API URL - use relative path for production (same domain)
const API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002');

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
  items: VkPost[];
  count: number;
}

interface VkNewsWidgetProps {
  count?: number;
  itemsPerPage?: number;
}

// Компонент карусели медиа
function MediaCarousel({ attachments, onOpen }: { attachments?: VkPost['attachments'], onOpen: () => void }) {
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
          <div className="photo-container relative overflow-hidden">
            <img
              src={largestImage}
              alt="Фото"
              className="w-full h-48 object-cover cursor-pointer"
              loading="lazy"
              onClick={onOpen}
              onError={(e) => {
                (e.target as HTMLImageElement).closest('.photo-container')?.remove();
              }}
            />
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
            className="block relative bg-gray-900 cursor-pointer group"
            onClick={onOpen}
          >
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={videoData.title}
                className="w-full h-48 object-cover opacity-90"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-2.19 0-3.8-.16-4.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L5 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c2.19 0 3.8.16 4.83.44.9.25 1.48.83 1.73 1.73z"/>
                </svg>
              </div>
            )}
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
      <div onClick={onOpen} className="cursor-pointer">
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

// Модальное окно просмотра поста
function PostModal({ post, onClose }: { post: VkPost; onClose: () => void }) {
  if (!post) return null;

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const photos = post.attachments?.filter(a => a.type === 'photo') || [];
  const videos = post.attachments?.filter(a => a.type === 'video') || [];
  const links = post.attachments?.filter(a => a.type === 'link') || [];

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-bold text-gray-900">Пост ВКонтакте</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Text */}
          {post.text && (
            <div className="mb-4">
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {stripHtml(post.text)}
              </p>
            </div>
          )}

          {/* Photos Grid */}
          {photos.length > 0 && (
            <div className="mb-4">
              <div className={`grid gap-2 ${
                photos.length === 1 ? 'grid-cols-1' :
                photos.length === 2 ? 'grid-cols-2' :
                photos.length === 3 ? 'grid-cols-2' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {photos.map((photo, idx) => {
                  const sizes = photo.photo?.sizes || [];
                  const largestImage = sizes.length > 0 
                    ? [...sizes].sort((a, b) => b.width - a.width)[0].url 
                    : photo.photo?.image;
                  
                  if (!largestImage) return null;

                  return (
                    <img
                      key={idx}
                      src={largestImage}
                      alt={`Фото ${idx + 1}`}
                      className={`w-full object-cover rounded-lg ${
                        photos.length === 1 ? 'h-96' :
                        photos.length === 2 ? 'h-64' :
                        photos.length === 3 && idx === 0 ? 'h-96 row-span-2' :
                        'h-48'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="mb-4 space-y-3">
              {videos.map((video, idx) => {
                const videoData = video.video;
                if (!videoData) return null;

                const thumbnail = videoData.image?.[0]?.url;

                return (
                  <a
                    key={idx}
                    href={videoData.link || videoData.player || `https://vk.com/video-${128344113}_${videoData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative bg-gray-900 rounded-lg overflow-hidden group"
                  >
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-blue-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={videoData.title}
                        className="w-full h-56 object-cover opacity-90"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                        <svg className="w-20 h-20 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-2.19 0-3.8-.16-4.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L5 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c2.19 0 3.8.16 4.83.44.9.25 1.48.83 1.73 1.73z"/>
                        </svg>
                      </div>
                    )}
                    {videoData.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-medium">{videoData.title}</p>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="mb-4 space-y-3">
              {links.map((link, idx) => {
                const linkData = link.link;
                if (!linkData) return null;

                const imageUrl = linkData.image?.[0]?.url;

                return (
                  <a
                    key={idx}
                    href={linkData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={linkData.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-3 bg-gray-50">
                      <p className="text-blue-600 text-sm font-medium line-clamp-2">
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
              })}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {formatDate(post.date)}
            </span>

            <div className="flex items-center gap-3">
              {post.likes && post.likes.count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-red-50 px-3 py-1.5 rounded-full">
                  <span>❤️</span>
                  <span className="font-medium">{post.likes.count}</span>
                </span>
              )}
              {post.comments && post.comments.count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-blue-50 px-3 py-1.5 rounded-full">
                  <span>💬</span>
                  <span className="font-medium">{post.comments.count}</span>
                </span>
              )}
              {post.reposts && post.reposts.count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-green-50 px-3 py-1.5 rounded-full">
                  <span>🔄</span>
                  <span className="font-medium">{post.reposts.count}</span>
                </span>
              )}
              {post.views && post.views.count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full">
                  <span>👁️</span>
                  <span className="font-medium">{post.views.count}</span>
                </span>
              )}
            </div>
          </div>

          {/* Open in VK button */}
          <a
            href={`https://vk.com/wall-${128344113}_${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0077FF] hover:bg-[#0066DD] text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.785 16.241s.327-.039.495-.238c.185-.22.179-.51.179-.51s-.026-3.75 1.676-4.304c1.707-.563 3.9 3.95 6.226 5.696 1.773 1.316 3.115 1.028 3.115 1.028l6.22-.09s3.25-.203 1.71-2.77c-.128-.21-.91-1.88-4.687-5.316-3.966-3.62-3.436-3.036 1.344-9.304.923-1.2.647-1.82-.614-1.82h-6.63s-.49-.035-.855.22c-.298.2-.49.65-.49.65s-.881 2.35-2.054 4.35c-2.476 4.2-3.468 4.95-3.872 4.66-.95-.57-.712-2.3-.712-3.53 0-3.84.558-5.44-1.088-5.86-.275-.07-.477-.12-1.182-.127-.865-.01-1.525.003-1.92.207-.264.135-.475.435-.35.453.155.022.505.097.69.355.24.33.23 1.07.23 1.07s1.38 8.08 3.23 12.15c1.5 3.22 2.23 4.22 3.48 4.22h.84s.99.07 1.19-.64c.09-.36.09-.78.09-1.28 0-2.5.18-3.55.81-3.9.4-.22 1.15-.15 1.9.11.5.18.87.3.96.47.14.24.1.78.1 1.2-.01.8.14 1.13.32 1.3.22.21.48.14.48.14z"/>
            </svg>
            Открыть во ВКонтакте
          </a>
        </div>
      </div>
    </div>
  );
}

export default function VkNewsWidget({ count = 50, itemsPerPage = 6 }: VkNewsWidgetProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<VkPost | null>(null);

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

  if (!data || data.items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Нет новостей</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.items.length / itemsPerPage);
  const currentPosts = data.items.slice(
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
          <h2 className="text-lg font-bold text-gray-900">
            Новости ВКонтакте
          </h2>
          <p className="text-xs text-gray-500">
            Страница {currentPage} из {totalPages}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Обновить
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentPosts.map((post) => {
          const text = stripHtml(post.text);
          const hasMedia = post.attachments && post.attachments.some(att => 
            ['photo', 'video', 'link'].includes(att.type)
          );

          return (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
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
                    onOpen={() => setSelectedPost(post)}
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
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                        <span>❤️</span>
                        <span className="font-medium">{post.likes.count}</span>
                      </span>
                    )}
                    {post.comments && post.comments.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        <span>💬</span>
                        <span className="font-medium">{post.comments.count}</span>
                      </span>
                    )}
                    {post.views && post.views.count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-full">
                        <span>👁️</span>
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
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
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
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}

      {/* Post Modal */}
      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
}
