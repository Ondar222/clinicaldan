import { vkService } from './vk.service.js';

export class VkController {
  static async getPosts(count = 10, offset = 0) {
    try {
      console.log(`📰 Fetching VK posts: count=${count}, offset=${offset}`);
      
      const result = await vkService.getPosts(count, offset);
      
      return {
        success: true,
        data: {
          items: result.items,
          count: result.count,
        },
      };
    } catch (error) {
      console.error('VK Controller - Error getting posts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getPostById(postId) {
    try {
      const post = await vkService.getPostById(postId);
      
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      console.error('VK Controller - Error getting post by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
