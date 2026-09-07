import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  }>;
}

interface VkPostsResponse {
  items?: VkPost[];
  count?: number;
  success?: boolean;
  data?: {
    posts: VkPost[];
    total: number;
  };
}

const fetcher = async (url: string) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch' }));
    throw new Error(error.error || error.message || 'Failed to fetch');
  }
  return response.json();
};

// Модальное окно для просмотра изображений на весь экран
function ImageModal({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      
      <button
        onClick={onClose}
        className="absolute top-4 left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <img
        src={imageUrl}
        alt="Полноразмерное изображение"
        className="max-w-full max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// Компонент для отображения фото с возможностью открытия на весь экран
function PhotoCard({ photo, onClick }: { photo: NonNullable<VkPost['attachments']>[number], onClick: (url: string) => void }) {
  const sizes = photo.photo?.sizes || [];
  const largestImage = sizes.length > 0
    ? [...sizes].sort((a, b) => b.width - a.width)[0].url
    : photo.photo?.image;

  if (!largestImage) return null;

  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-xl"
      onClick={() => onClick(largestImage)}
    >
      <img
        src={largestImage}
        alt="Фото"
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 3v3m4-3h3M7 10a3 3 0 100-6 3 3 0 000 6z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Компонент видео
function VideoCard({ video }: { video: NonNullable<VkPost['attachments']>[number] }) {
  const videoData = video.video;
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoData) return null;

  // Получаем thumbnail лучшего качества
  const thumbnail = videoData.image?.[videoData.image.length - 1]?.url || videoData.image?.[0]?.url;
  
  // Формируем URL для встраивания видео
  // Если есть player URL - используем его, иначе формируем внешний URL
  const playerUrl = videoData.player || `https://vk.com/video_ext.php?oid=-128344113&id=${videoData.id}&hd=2`;
  
  // Ссылка на видео ВКонтакте
  const videoLink = `https://vk.com/video-${128344113}_${videoData.id}`;

  if (isPlaying) {
    return (
      <div className="relative w-full h-80 md:h-96 bg-gray-900 rounded-xl overflow-hidden">
        <iframe
          src={playerUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture;"
          allowFullScreen
          title={videoData.title}
        />
      </div>
    );
  }

  return (
    <div className="block relative bg-gray-900 rounded-xl overflow-hidden group">
      {/* Кнопка Play */}
      <a
        href={videoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center z-10"
        onClick={(e) => {
          e.preventDefault();
          setIsPlaying(true);
        }}
      >
        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <svg className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </a>
      
      {/* Thumbnail */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={videoData.title}
          className="w-full h-80 md:h-96 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-80 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
          <svg className="w-24 h-24 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-2.19 0-3.8-.16-4.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L5 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c2.19 0 3.8.16 4.83.44.9.25 1.48.83 1.73 1.73z"/>
          </svg>
        </div>
      )}
      
      {/* Название видео */}
      {videoData.title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-white text-base font-medium">{videoData.title}</p>
        </div>
      )}
      
      {/* Кнопка открыть в VK */}
      <a
        href={videoLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-blue-600 rounded-lg text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.785 16.241s.327-.039.495-.238c.185-.22.179-.51.179-.51s-.026-3.75 1.676-4.304c1.707-.563 3.9 3.95 6.226 5.696 1.773 1.316 3.115 1.028 3.115 1.028l6.22-.09s3.25-.203 1.71-2.77c-.128-.21-.91-1.88-4.687-5.316-3.966-3.62-3.436-3.036 1.344-9.304.923-1.2.647-1.82-.614-1.82h-6.63s-.49-.035-.855.22c-.298.2-.49.65-.49.65s-.881 2.35-2.054 4.35c-2.476 4.2-3.468 4.95-3.872 4.66-.95-.57-.712-2.3-.712-3.53 0-3.84.558-5.44-1.088-5.86-.275-.07-.477-.12-1.182-.127-.865-.01-1.525.003-1.92.207-.264.135-.475.435-.35.453.155.022.505.097.69.355.24.33.23 1.07.23 1.07s1.38 8.08 3.23 12.15c1.5 3.22 2.23 4.22 3.48 4.22h.84s.99.07 1.19-.64c.09-.36.09-.78.09-1.28 0-2.5.18-3.55.81-3.9.4-.22 1.15-.15 1.9.11.5.18.87.3.96.47.14.24.1.78.1 1.2-.01.8.14 1.13.32 1.3.22.21.48.14.48.14z"/>
        </svg>
        Смотреть в VK
      </a>
    </div>
  );
}

// Компонент ссылки
function LinkCard({ link }: { link: NonNullable<VkPost['attachments']>[number] }) {
  const linkData = link.link;
  if (!linkData) return null;

  const imageUrl = linkData.image?.[0]?.url;

  return (
    <a
      href={linkData.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-200"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={linkData.title}
          className="w-full h-48 md:h-64 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <p className="text-sm text-gray-500">Внешняя ссылка</p>
          </div>
        </div>
      )}
      <div className="p-4 bg-gray-50">
        <p className="text-blue-600 text-sm font-semibold line-clamp-2">
          {linkData.title}
        </p>
        {linkData.description && (
          <p className="text-gray-600 text-xs mt-2 line-clamp-3">
            {linkData.description}
          </p>
        )}
      </div>
    </a>
  );
}

export default function VkPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR<VkPostsResponse>(
    id ? `/api/vk/posts?count=100&offset=0` : null,
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/news')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Назад к новостям
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Загрузка поста...</p>
        </div>
      </div>
    );
  }

  const posts = data?.data?.posts || data?.items || [];
  const post = posts.find(p => p.id.toString() === id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Пост не найден</h2>
          <p className="text-gray-600 text-sm mb-4">Возможно, он был удален или перемещен</p>
          <button
            onClick={() => navigate('/news')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Назад к новостям
          </button>
        </div>
      </div>
    );
  }

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

  const photos = (post.attachments?.filter(a => a.type === 'photo') || []) as NonNullable<VkPost['attachments']>;
  const videos = (post.attachments?.filter(a => a.type === 'video') || []) as NonNullable<VkPost['attachments']>;
  const links = (post.attachments?.filter(a => a.type === 'link') || []) as NonNullable<VkPost['attachments']>;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#fdf2f4] via-white to-[#fdf2f4] overflow-hidden">
      {/* Мягкие декоративные пятна */}
      <div className="fixed -left-20 top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -right-10 bottom-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section
        className="py-10 sm:py-14 md:py-18 bg-cover bg-center relative"
        style={{ backgroundImage: "url(/bg_8.avif)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-block mb-4">
            <svg className="w-10 h-10 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
            Новости клиники Алдан
          </h1>
          <p className="text-white/80 text-sm">Новости, акции и полезные статьи</p>
        </div>
      </section>

      <div className="container mx-auto px-4 relative z-10 py-8 sm:py-10 md:py-12">
      {/* Модальное окно просмотра изображения */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate('/news')}
          className="inline-flex items-center gap-2 text-primary hover:text-primaryDark transition-colors mb-6 group font-medium"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Назад к новостям</span>
        </button>

        {/* Основной контент */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-primary/10">
          {/* Заголовок с датой */}
          <div className="bg-gradient-to-r from-primary to-primaryDark px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.785 16.241s.327-.039.495-.238c.185-.22.179-.51.179-.51s-.026-3.75 1.676-4.304c1.707-.563 3.9 3.95 6.226 5.696 1.773 1.316 3.115 1.028 3.115 1.028l6.22-.09s3.25-.203 1.71-2.77c-.128-.21-.91-1.88-4.687-5.316-3.966-3.62-3.436-3.036 1.344-9.304.923-1.2.647-1.82-.614-1.82h-6.63s-.49-.035-.855.22c-.298.2-.49.65-.49.65s-.881 2.35-2.054 4.35c-2.476 4.2-3.468 4.95-3.872 4.66-.95-.57-.712-2.3-.712-3.53 0-3.84.558-5.44-1.088-5.86-.275-.07-.477-.12-1.182-.127-.865-.01-1.525.003-1.92.207-.264.135-.475.435-.35.453.155.022.505.097.69.355.24.33.23 1.07.23 1.07s1.38 8.08 3.23 12.15c1.5 3.22 2.23 4.22 3.48 4.22h.84s.99.07 1.19-.64c.09-.36.09-.78.09-1.28 0-2.5.18-3.55.81-3.9.4-.22 1.15-.15 1.9.11.5.18.87.3.96.47.14.24.1.78.1 1.2-.01.8.14 1.13.32 1.3.22.21.48.14.48.14z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">ВКонтакте</h1>
                  <p className="text-red-100 text-xs">Официальная страница</p>
                </div>
              </div>
              <a
                href={`https://vk.com/wall-${128344113}_${post.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Открыть в VK
              </a>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Дата публикации */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{formatDate(post.date)}</span>
            </div>

            {/* Текст поста */}
            {post.text && (
              <div className="mb-8">
                <p className="text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {stripHtml(post.text)}
                </p>
              </div>
            )}

            {/* Фотографии */}
            {photos.length > 0 && (
              <div className="mb-8">
                <div className={`grid gap-4 ${
                  photos.length === 1 ? 'grid-cols-1' :
                  photos.length === 2 ? 'grid-cols-2' :
                  photos.length === 3 ? 'grid-cols-2' :
                  'grid-cols-2 md:grid-cols-3'
                }`}>
                  {photos.map((photo, idx) => (
                    <PhotoCard
                      key={idx}
                      photo={photo}
                      onClick={setSelectedImage}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Видео */}
            {videos.length > 0 && (
              <div className="mb-8 space-y-4">
                {videos.map((video, idx) => (
                  <VideoCard key={idx} video={video} />
                ))}
              </div>
            )}

            {/* Ссылки */}
            {links.length > 0 && (
              <div className="mb-8 space-y-4">
                {links.map((link, idx) => (
                  <LinkCard key={idx} link={link} />
                ))}
              </div>
            )}

            {/* Статистика */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 flex-wrap">
                {post.likes && post.likes.count > 0 && (
                  <span className="inline-flex items-center gap-2 text-sm text-primary bg-red-50 px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="font-semibold">{post.likes.count}</span>
                  </span>
                )}
                {post.comments && post.comments.count > 0 && (
                  <span className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                    <span className="font-semibold">{post.comments.count}</span>
                  </span>
                )}
                {post.reposts && post.reposts.count > 0 && (
                  <span className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    <span className="font-semibold">{post.reposts.count}</span>
                  </span>
                )}
                {post.views && post.views.count > 0 && (
                  <span className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span className="font-semibold">{post.views.count}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Кнопка назад внизу */}
   
      </div>
      </div>
    </div>
  );
}
