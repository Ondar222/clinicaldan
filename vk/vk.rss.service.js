import fetch from 'node-fetch';

const VK_RSS_URL = 'https://vk.com/feeds.php?act=rss&id=-128344113';

export class VkRssService {
  /**
   * Get posts from VK RSS feed (no token required)
   * @param {number} count - Number of posts to retrieve
   * @returns {Promise<Array>}
   */
  async getPosts(count = 10) {
    try {
      const response = await fetch(VK_RSS_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });

      if (!response.ok) {
        throw new Error(`RSS feed returned status ${response.status}`);
      }

      const xml = await response.text();
      const posts = this.parseRSS(xml);
      
      return posts.slice(0, count);
    } catch (error) {
      console.error('Error fetching VK RSS:', error.message);
      throw error;
    }
  }

  /**
   * Parse RSS XML manually (no external dependencies)
   */
  parseRSS(xml) {
    const posts = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      
      const title = this.extractTag(item, 'title');
      const link = this.extractTag(item, 'link');
      const pubDate = this.extractTag(item, 'pubDate');
      const description = this.extractTag(item, 'description');
      const guid = this.extractTag(item, 'guid');
      
      // Extract image from enclosure or content
      const enclosureMatch = /<enclosure[^>]*url="([^"]*)"/i.exec(item);
      const imageUrl = enclosureMatch ? enclosureMatch[1] : null;

      if (title && link) {
        posts.push({
          id: guid || link,
          title: this.decodeHTML(title),
          link: this.decodeHTML(link),
          pubDate: this.decodeHTML(pubDate),
          description: this.decodeHTML(description),
          image: imageUrl,
        });
      }
    }

    return posts;
  }

  extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  decodeHTML(html) {
    if (!html) return '';
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }
}

export const vkRssService = new VkRssService();
