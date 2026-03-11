import { kv as kvClient } from '@vercel/kv';

export type { kvClient };

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await kvClient.get(key) as T | null;
    } catch (error) {
      console.error('KV GET error:', key, error);
      return null;
    }
  },

  async set<T>(key: string, value: T, options?: Record<string, unknown>): Promise<void> {
    try {
      await kvClient.set(key, value, options as Parameters<typeof kvClient.set>[2]);
    } catch (error) {
      console.error('KV SET error:', key, error);
      throw error;
    }
  },

  async del(key: string): Promise<void> {
    try {
      await kvClient.del(key);
    } catch (error) {
      console.error('KV DEL error:', key, error);
      throw error;
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const result = await kvClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('KV EXISTS error:', key, error);
      return false;
    }
  },

  async lpush<T>(key: string, ...elements: T[]): Promise<number> {
    try {
      return await kvClient.lpush(key, ...elements);
    } catch (error) {
      console.error('KV LPUSH error:', key, error);
      return 0;
    }
  },

  async rpush<T>(key: string, ...elements: T[]): Promise<number> {
    try {
      return await kvClient.rpush(key, ...elements);
    } catch (error) {
      console.error('KV RPUSH error:', key, error);
      return 0;
    }
  },

  async lrange<T>(key: string, start: number, end: number): Promise<T[]> {
    try {
      return await kvClient.lrange(key, start, end) as T[];
    } catch (error) {
      console.error('KV LRANGE error:', key, error);
      return [];
    }
  },

  async ltrim(key: string, start: number, end: number): Promise<void> {
    try {
      await kvClient.ltrim(key, start, end);
    } catch (error) {
      console.error('KV LTRIM error:', key, error);
    }
  },

  async lrem(key: string, count: number, element: string): Promise<number> {
    try {
      return await kvClient.lrem(key, count, element);
    } catch (error) {
      console.error('KV LREM error:', key, error);
      return 0;
    }
  },

  async sadd<T>(key: string, ...members: T[]): Promise<number> {
    try {
      return await kvClient.sadd(key, members as [unknown, ...unknown[]]);
    } catch (error) {
      console.error('KV SADD error:', key, error);
      return 0;
    }
  },

  async sismember<T>(key: string, member: T): Promise<boolean> {
    try {
      const result = await kvClient.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error('KV SISMEMBER error:', key, error);
      return false;
    }
  },

  async smembers<T>(key: string): Promise<T[]> {
    try {
      return await kvClient.smembers(key) as T[];
    } catch (error) {
      console.error('KV SMEMBERS error:', key, error);
      return [];
    }
  },

  async srem<T>(key: string, ...members: T[]): Promise<number> {
    try {
      return await kvClient.srem(key, members as [unknown, ...unknown[]]);
    } catch (error) {
      console.error('KV SREM error:', key, error);
      return 0;
    }
  },

  async incr(key: string): Promise<number> {
    try {
      return await kvClient.incr(key);
    } catch (error) {
      console.error('KV INCR error:', key, error);
      return 0;
    }
  },

  async decr(key: string): Promise<number> {
    try {
      return await kvClient.decr(key);
    } catch (error) {
      console.error('KV DECR error:', key, error);
      return 0;
    }
  },

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await kvClient.expire(key, seconds);
    } catch (error) {
      console.error('KV EXPIRE error:', key, error);
    }
  },

  async ttl(key: string): Promise<number> {
    try {
      return await kvClient.ttl(key);
    } catch (error) {
      console.error('KV TTL error:', key, error);
      return -2;
    }
  },
};

export const userKeys = {
  profile: (userId: string) => `user:${userId}`,
  reviews: (userId: string) => `reviews:${userId}`,
  templates: (userId: string) => `templates:${userId}`,
  commands: (userId: string) => `commands:${userId}`,
  customDocs: (userId: string) => `customdocs:${userId}`,
};

export const reviewKeys = {
  data: (reviewId: string) => `review:${reviewId}`,
  streamChunks: (jobId: string) => `stream:${jobId}:chunks`,
  streamStatus: (jobId: string) => `stream:${jobId}:status`,
  streamError: (jobId: string) => `stream:${jobId}:error`,
};

export const docKeys = {
  cache: (lang: string, sectionHash: string) => `doccache:${lang}:${sectionHash}`,
};
