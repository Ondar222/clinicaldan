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
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://clinicaldan.ru/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `VK API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Если не JSON, используем текст как есть
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Проверяем наличие ошибки в ответе
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error: any) {
      console.error('VK service request error:', error);
      throw error;
    }
  }

  /**
   * Получает посты из VK
   * @param offset - смещение для пагинации
   * @param count - количество постов
   */
  async getPosts(offset: number = 0, count: number = 10): Promise<VKPostsResponse> {
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        count: count.toString(),
      });

      const data = await this.request<VKPostsResponse>(`/vk/posts?${params}`);
      
      // Форматируем даты
      const posts = data.posts.map(post => ({
        ...post,
        formattedDate: this.formatDate(post.date),
      }));

      return {
        ...data,
        posts,
      };
    } catch (error) {
      console.error('Error fetching VK posts:', error);
      throw error;
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

