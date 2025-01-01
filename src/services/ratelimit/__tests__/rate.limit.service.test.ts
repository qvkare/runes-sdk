import { jest } from '@jest/globals';
import { RateLimitService } from '../rate.limit.service';
import { createMockLogger } from '../../../utils/test.utils';
import { RateLimitConfig } from '../../../types/ratelimit.types';

describe('RateLimitService', () => {
  let service: RateLimitService;
  const mockLogger = createMockLogger();
  const config: RateLimitConfig = {
    maxRequestsPerWindow: 10,
    windowSize: 60000, // 1 minute
    maxRequestsPerDay: 100,
    cleanupInterval: 300000, // 5 minutes
    cleanupThreshold: 3600000 // 1 hour
  };

  beforeEach(() => {
    jest.useFakeTimers();
    service = new RateLimitService(config, mockLogger);
  });

  afterEach(() => {
    service.stopCleanupInterval();
    jest.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should create new rate limit for new user', () => {
      const result = service.checkRateLimit('user1');
      expect(result.remaining).toBe(9);
      expect(result.limit).toBe(10);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should track requests within window', () => {
      const userId = 'user2';
      service.checkRateLimit(userId);
      service.checkRateLimit(userId);
      const result = service.checkRateLimit(userId);
      expect(result.remaining).toBe(7);
    });

    it('should reset requests after window expires', () => {
      const userId = 'user3';
      service.checkRateLimit(userId);
      
      // Simulate window expiration
      jest.advanceTimersByTime(config.windowSize + 1000);
      
      const result = service.checkRateLimit(userId);
      expect(result.remaining).toBe(9);
    });

    it('should enforce daily limit', () => {
      const userId = 'user4';
      for (let i = 0; i < config.maxRequestsPerDay; i++) {
        service.checkRateLimit(userId);
      }
      const result = service.checkRateLimit(userId);
      expect(result.remaining).toBe(0);
    });

    it('should reset daily limit after 24 hours', () => {
      const userId = 'user5';
      service.checkRateLimit(userId);
      
      // Simulate day expiration
      jest.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000);
      
      const result = service.checkRateLimit(userId);
      expect(result.remaining).toBe(9);
    });

    it('should log warning when rate limit is exceeded', () => {
      const userId = 'user6';
      for (let i = 0; i < config.maxRequestsPerWindow + 1; i++) {
        service.checkRateLimit(userId);
      }
      expect(mockLogger.warn).toHaveBeenCalledWith(`Rate limit exceeded for user: ${userId}`);
    });
  });

  describe('cleanup', () => {
    it('should cleanup expired rate limits', () => {
      const userId = 'user7';
      service.checkRateLimit(userId);
      
      // Simulate threshold expiration
      jest.advanceTimersByTime(config.cleanupThreshold + 1000);
      
      // Trigger cleanup
      jest.advanceTimersByTime(config.cleanupInterval);
      
      expect(mockLogger.info).toHaveBeenCalledWith(`Cleaned up rate limit data for user: ${userId}`);
    });

    it('should not cleanup active rate limits', () => {
      const userId = 'user8';
      service.checkRateLimit(userId);
      
      // Advance time but not beyond threshold
      jest.advanceTimersByTime(config.cleanupThreshold - 1000);
      
      // Trigger cleanup
      jest.advanceTimersByTime(config.cleanupInterval);
      
      expect(mockLogger.info).not.toHaveBeenCalledWith(`Cleaned up rate limit data for user: ${userId}`);
    });
  });
});
