import { RateLimitConfig } from './ratelimit.types';
import { ValidationConfig } from './validation.types';
import { SecurityConfig } from './security.types';
import { MempoolConfig } from './mempool.types';

export interface SDKConfig {
  host: string;
  username: string;
  password: string;
  rateLimitConfig?: RateLimitConfig;
  validationConfig?: ValidationConfig;
  securityConfig?: SecurityConfig;
  mempoolConfig?: MempoolConfig;
}
