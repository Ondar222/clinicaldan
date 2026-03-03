export interface VKPost {
  id: number;
  date: number;
  text: string;
  imageUrl?: string;
  formattedDate?: string;
}

export interface VKPostsResponse {
  posts: VKPost[];
  total: number;
  error?: string;
}

class VKService {
  // Use backend via same origin (Vite proxy in dev, nginx in prod) to avoid CORS
  private apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '') + '/api/vk';

  /**
   * Получает посты из VK через backend proxy
   * @param offset - смещение для пагинации
   * @param count - количество постов
   */
  async getPosts(offset: number = 0, count: number = 10): Promise<VKPostsResponse> {
    try {
      const url = `${this.apiBaseUrl}/posts?count=${count}&offset=${offset}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map backend response to frontend format
      const posts = (data.items || [])
        .filter((item: any) => !item.marked_as_ads && item.date)
        .map((item: any) => {
          // Extract image if available
          let imageUrl: string | undefined;
          if (item.attachments && item.attachments.length > 0) {
            const photo = item.attachments.find((a: any) => a.type === 'photo');
            if (photo) {
              const sizes = photo.photo.sizes || [];
              const largest = sizes[sizes.length - 1];
              imageUrl = largest?.url || photo.photo.photo_604 || photo.photo.photo_200;
            }
          }

          // Strip HTML tags from text
          const text = item.text
            ? item.text
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .trim()
            : '';

          return {
            id: item.id,
            date: item.date,
            text: text || 'Без текста',
            imageUrl,
          };
        });

      return {
        posts,
        total: data.count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching VK posts:', error);
      return {
        posts: [],
        total: 0,
        error: error.message || 'Не удалось загрузить новости',
      };
    }
  }

  /**
   * Форматирует дату из timestamp
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Обрезает текст поста до указанной длины
   */
  truncateText(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}

export default new VKService();

