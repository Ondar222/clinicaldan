/**
 * IndexedDB Cache Service
 * Provides fast, persistent storage for large datasets (services, doctors, etc.)
 * Much faster than localStorage for large data (>1MB)
 */

const DB_NAME = 'clinicaldan_cache_v1';
const DB_VERSION = 1;
const STORE_NAME = 'data';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version?: string;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('IndexedDB error:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  async set<T>(key: string, data: T, ttlMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: '1'
      };

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put({ key, ...entry });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
          console.warn('IndexedDB set error');
          resolve(); // Don't fail, just ignore
        };
      });
    } catch (error) {
      console.warn('IndexedDB set failed:', error);
    }
  }

  async get<T>(key: string, ttlMs: number): Promise<T | null> {
    try {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result as CacheEntry<T> | undefined;
          if (!result || !result.data) {
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() - result.timestamp > ttlMs) {
            resolve(null);
            return;
          }

          resolve(result.data);
        };

        request.onerror = () => {
          console.warn('IndexedDB get error');
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('IndexedDB get failed:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch (error) {
      console.warn('IndexedDB remove failed:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch (error) {
      console.warn('IndexedDB clear failed:', error);
    }
  }

  // Check if IndexedDB is available
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }
}

export const indexedDBCache = new IndexedDBCache();
export default indexedDBCache;
export { IndexedDBCache };
