import { RateLimitConfig, RateLimitInfo } from '../../types/ratelimit.types';
import { Logger } from '../../types/logger.types';

interface UserRateLimit {
  requests: number;
  lastReset: number;
  dailyRequests: number;
  lastDailyReset: number;
}

export class RateLimitService {
  private userLimits: Map<string, UserRateLimit> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: RateLimitConfig,
    private readonly logger: Logger
  ) {
    this.startCleanupInterval();
  }

  checkRateLimit(userId: string): RateLimitInfo {
    const now = Date.now();
    let userLimit = this.userLimits.get(userId);

    if (!userLimit) {
      userLimit = {
        requests: 0,
        lastReset: now,
        dailyRequests: 0,
        lastDailyReset: now,
      };
      this.userLimits.set(userId, userLimit);
    }

    // Window-based limit check
    if (now - userLimit.lastReset >= this.config.windowSize) {
      userLimit.requests = 0;
      userLimit.lastReset = now;
    }

    // Daily limit check
    const dayInMs = 24 * 60 * 60 * 1000;
    if (now - userLimit.lastDailyReset >= dayInMs) {
      userLimit.dailyRequests = 0;
      userLimit.lastDailyReset = now;
    }

    userLimit.requests++;
    userLimit.dailyRequests++;

    const remaining = Math.max(
      0,
      Math.min(
        this.config.maxRequestsPerWindow - userLimit.requests,
        this.config.maxRequestsPerDay - userLimit.dailyRequests
      )
    );

    const reset = Math.min(
      userLimit.lastReset + this.config.windowSize,
      userLimit.lastDailyReset + dayInMs
    );

    const isLimited = remaining <= 0;
    if (isLimited) {
      this.logger.warn(`Rate limit exceeded for user: ${userId}`);
    }

    return {
      remaining,
      reset,
      limit: Math.min(this.config.maxRequestsPerWindow, this.config.maxRequestsPerDay),
    };
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const threshold = now - this.config.cleanupThreshold;

      for (const [userId, limit] of this.userLimits.entries()) {
        if (limit.lastReset < threshold && limit.lastDailyReset < threshold) {
          this.userLimits.delete(userId);
          this.logger.info(`Cleaned up rate limit data for user: ${userId}`);
        }
      }
    }, this.config.cleanupInterval);
  }

  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
