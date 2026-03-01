import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const VK_API_BASE = 'https://api.vk.com/method';

export class VkService {
  #token;
  #version;
  #ownerId;

  constructor() {
    this.#token = process.env.VK_API_TOKEN || '';
    this.#version = '5.131';
    this.#ownerId = process.env.VK_OWNER_ID || '-128344113';
  }

  async #request(method, params = {}) {
    const url = new URL(`${VK_API_BASE}/${method}`);
    url.searchParams.set('access_token', this.#token);
    url.searchParams.set('v', this.#version);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(`VK API Error: ${data.error.error_msg} (${data.error.error_code})`);
    }

    return data.response;
  }

  async getPosts(count = 10, offset = 0) {
    const limitedCount = Math.min(count, 100);
    
    const response = await this.#request('wall.get', {
      owner_id: this.#ownerId,
      count: limitedCount,
      offset: offset,
      extended: 0,
    });

    return response;
  }

  async getPostById(postId) {
    const response = await this.#request('wall.getById', {
      posts: `${this.#ownerId}_${postId}`,
      extended: 0,
    });

    if (!response.items || response.items.length === 0) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    return response.items[0];
  }
}

export const vkService = new VkService();
