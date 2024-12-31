export interface PerformanceMetrics {
  requestCount: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate?: number;
  throughput?: number;
  lastUpdated?: number;
}

export interface TransactionMetrics {
  totalCount: number;
  successCount: number;
  failureCount: number;
  averageAmount: string;
  totalVolume: string;
  successRate?: number;
  averageTransactionTime?: number;
  lastUpdated?: number;
} 