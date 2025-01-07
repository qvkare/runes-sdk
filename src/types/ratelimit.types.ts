export interface RateLimitConfig {
  maxRequestsPerWindow: number;
  windowSize: number;
  maxRequestsPerDay: number;
  cleanupInterval: number;
  cleanupThreshold: number;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
  windowStart?: number;
  lastRequest?: number;
}

export interface RateLimitStatus {
  isLimited: boolean;
  remainingRequests: number;
  resetTime: number;
  windowSize: number;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
