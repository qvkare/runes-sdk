import Redis from 'ioredis';
import { MonitoringService } from './monitoring';

interface RateLimitConfig {
  points: number; // Number of allowed requests
  duration: number; // Time window in seconds
  blockDuration?: number; // Block duration in seconds when limit is exceeded
}

interface RateLimitResult {
  isAllowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
}

export class RateLimiter {
  private redis: Redis;
  private keyPrefix: string;

  constructor(
    private monitoring: MonitoringService,
    redisConfig: { host: string; port: number; password?: string } = {
      host: 'localhost',
      port: 6379,
    }
  ) {
    this.redis = new Redis(redisConfig);
    this.keyPrefix = 'ratelimit:';

    // Listen for Redis errors
    this.redis.on('error', (error) => {
      this.monitoring.logError('Rate limiter Redis error', error);
    });
  }

  async checkLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // Check block status
      const blockKey = `${key}:blocked`;
      const blockedUntil = await this.redis.get(blockKey);

      if (blockedUntil) {
        const blockExpiry = parseInt(blockedUntil);
        if (now < blockExpiry) {
          return {
            isAllowed: false,
            remaining: 0,
            resetTime: blockExpiry,
            blockedUntil: blockExpiry,
          };
        }
        await this.redis.del(blockKey);
      }

      // Check rate limit
      const result = await this.redis
        .multi()
        .zremrangebyscore(key, 0, now - config.duration)
        .zcard(key)
        .zadd(key, now, `${now}:${Math.random()}`)
        .expire(key, config.duration)
        .exec();

      if (!result) {
        throw new Error('Rate limit check failed');
      }

      const count = result[1][1] as number;
      const allowed = count < config.points;

      // Update metrics
      this.monitoring.trackRateLimit(identifier, allowed ? 'allowed' : 'blocked');

      if (!allowed && config.blockDuration) {
        const blockExpiry = now + config.blockDuration;
        await this.redis.setex(blockKey, config.blockDuration, String(blockExpiry));

        return {
          isAllowed: false,
          remaining: 0,
          resetTime: now + config.duration,
          blockedUntil: blockExpiry,
        };
      }

      return {
        isAllowed: allowed,
        remaining: Math.max(config.points - count, 0),
        resetTime: now + config.duration,
      };
    } catch (error) {
      this.monitoring.logError('Rate limit check error', error, { identifier });

      // Allow but monitor on error
      this.monitoring.trackRateLimit(identifier, 'error');

      return {
        isAllowed: true,
        remaining: 0,
        resetTime: now + config.duration,
      };
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}${identifier}`;
    const blockKey = `${key}:blocked`;

    try {
      await this.redis.multi().del(key).del(blockKey).exec();

      this.monitoring.logInfo('Rate limit reset', { identifier });
    } catch (error) {
      this.monitoring.logError('Rate limit reset error', error, { identifier });
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
