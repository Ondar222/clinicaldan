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
  // VK Group ID for clinicaaldan
  private groupId: string = 'clinicaaldan';
  private accessToken: string = import.meta.env.VITE_VK_ACCESS_TOKEN || '';

  /**
   * Получает посты из VK
   * @param offset - смещение для пагинации
   * @param count - количество постов
   */
  async getPosts(offset: number = 0, count: number = 10): Promise<VKPostsResponse> {
    try {
      // Используем VK API напрямую
      const url = 'https://api.vk.com/method/wall.get';
      const params = new URLSearchParams({
        owner_id: '-128344113', // Отрицательный ID для сообществ (128344113 -> -128344113)
        count: count.toString(),
        offset: offset.toString(),
        filter: 'owner',
        v: '5.131',
      });

      if (this.accessToken) {
        params.append('access_token', this.accessToken);
      }

      const response = await fetch(`${url}?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.error_msg || 'VK API error');
      }

      const posts = data.response.items
        .filter((item: any) => !item.marked_as_ads && item.date)
        .map((item: any) => {
          // Extract image if available
          let imageUrl: string | undefined;
          if (item.attachments && item.attachments.length > 0) {
            const photo = item.attachments.find((a: any) => a.type === 'photo');
            if (photo) {
              // Get the largest available photo size
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
        total: data.response.count,
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

