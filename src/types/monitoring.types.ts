export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export interface WebSocketMetrics {
  messageCount: number;
  errorCount: number;
  reconnectCount: number;
  latency: number;
  messageRate: number;
  bandwidthUsage: number;
  activeConnections: number;
  peakConnections: number;
  lastCleanupTime: number;
  cacheSize: number;
  uptime: number;
  lastHeartbeat: number;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    external: number;
    rss: number;
  };
}

export interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  pendingRequests: number;
  activeSubscriptions: number;
  cacheHitRate: number;
  cacheMissRate: number;
  timestamp: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheckTime: number;
  components: {
    websocket: {
      status: string;
      connections: number;
      errors: number;
    };
    cache: {
      status: string;
      size: number;
      hitRate: number;
    };
    database?: {
      status: string;
      connectionPool: number;
      queryLatency: number;
    };
  };
}
