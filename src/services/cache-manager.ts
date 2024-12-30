import Redis from 'ioredis';
import { MonitoringService } from './monitoring';

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  ttl: number;
}

export class CacheManager {
  private redis: Redis;
  private defaultTTL: number;

  constructor(
    private monitoring: MonitoringService,
    config: CacheConfig = {
      host: 'localhost',
      port: 6379,
      ttl: 3600, // 1 hour
    }
  ) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'runes:',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.defaultTTL = config.ttl;

    // Listen for Redis connection events
    this.redis.on('connect', () => {
      this.monitoring.logInfo('Redis connected');
    });

    this.redis.on('error', (error) => {
      this.monitoring.logError('Redis connection error', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const start = Date.now();
      const data = await this.redis.get(key);
      const duration = Date.now() - start;

      // Update cache metrics
      this.monitoring.trackCacheOperation('get', data ? 'hit' : 'miss');
      this.monitoring.trackCacheDuration('get', duration);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.monitoring.logError('Cache get error', error, { key });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const start = Date.now();
      const data = JSON.stringify(value);

      if (ttl) {
        await this.redis.setex(key, ttl, data);
      } else {
        await this.redis.setex(key, this.defaultTTL, data);
      }

      const duration = Date.now() - start;
      this.monitoring.trackCacheOperation('set', 'success');
      this.monitoring.trackCacheDuration('set', duration);
    } catch (error) {
      this.monitoring.logError('Cache set error', error, { key });
    }
  }

  async del(key: string): Promise<void> {
    try {
      const start = Date.now();
      await this.redis.del(key);
      const duration = Date.now() - start;

      this.monitoring.trackCacheOperation('del', 'success');
      this.monitoring.trackCacheDuration('del', duration);
    } catch (error) {
      this.monitoring.logError('Cache delete error', error, { key });
    }
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T | null> {
    try {
      // Check cache first
      const cached = await this.get<T>(key);
      if (cached) return cached;

      // Fetch data if not in cache
      const data = await fetchFn();
      if (data) {
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      this.monitoring.logError('Cache getOrSet error', error, { key });
      return null;
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      const start = Date.now();
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      const duration = Date.now() - start;
      this.monitoring.trackCacheOperation('clear', 'success');
      this.monitoring.trackCacheDuration('clear', duration);
    } catch (error) {
      this.monitoring.logError('Cache clear error', error, { pattern });
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
