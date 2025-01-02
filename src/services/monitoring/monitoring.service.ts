import { Logger } from '../logger/logger.service';
import {
  Metric,
  MetricType,
  WebSocketMetrics,
  PerformanceMetrics,
  SystemHealth,
} from '../../types/monitoring.types';

export class MonitoringService {
  private metrics: Map<string, Metric>;
  private wsMetrics!: WebSocketMetrics;
  private performanceMetrics!: PerformanceMetrics;
  private startTime: number;

  constructor(private readonly logger: Logger) {
    this.metrics = new Map();
    this.startTime = Date.now();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.wsMetrics = {
      messageCount: 0,
      errorCount: 0,
      reconnectCount: 0,
      latency: 0,
      messageRate: 0,
      bandwidthUsage: 0,
      activeConnections: 0,
      peakConnections: 0,
      lastCleanupTime: Date.now(),
      cacheSize: 0,
      uptime: 0,
      lastHeartbeat: Date.now(),
      memoryUsage: {
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        rss: 0,
      },
    };

    this.performanceMetrics = {
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      successRate: 100,
      pendingRequests: 0,
      activeSubscriptions: 0,
      cacheHitRate: 0,
      cacheMissRate: 0,
      timestamp: Date.now(),
    };
  }

  public recordMetric(metric: Metric): void {
    this.metrics.set(metric.name, metric);
    this.logger.debug(`Metric recorded: ${metric.name}=${metric.value}`);
  }

  public updateWebSocketMetrics(update: Partial<WebSocketMetrics>): void {
    this.wsMetrics = { ...this.wsMetrics, ...update };
    this.updateMemoryUsage();
  }

  public updatePerformanceMetrics(update: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...update };
  }

  private updateMemoryUsage(): void {
    const memory = process.memoryUsage();
    this.wsMetrics.memoryUsage = {
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      rss: memory.rss,
    };
  }

  public getSystemHealth(): SystemHealth {
    const wsStatus = this.calculateWebSocketHealth();
    const cacheStatus = this.calculateCacheHealth();

    return {
      status: this.calculateOverallHealth(wsStatus, cacheStatus),
      uptime: Date.now() - this.startTime,
      lastCheckTime: Date.now(),
      components: {
        websocket: {
          status: wsStatus,
          connections: this.wsMetrics.activeConnections,
          errors: this.wsMetrics.errorCount,
        },
        cache: {
          status: cacheStatus,
          size: this.wsMetrics.cacheSize,
          hitRate: this.performanceMetrics.cacheHitRate,
        },
      },
    };
  }

  private calculateWebSocketHealth(): string {
    const errorRate = this.wsMetrics.errorCount / this.wsMetrics.messageCount;
    if (errorRate > 0.1) return 'unhealthy';
    if (errorRate > 0.05) return 'degraded';
    return 'healthy';
  }

  private calculateCacheHealth(): string {
    if (this.performanceMetrics.cacheHitRate < 50) return 'degraded';
    return 'healthy';
  }

  private calculateOverallHealth(
    wsStatus: string,
    cacheStatus: string
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (wsStatus === 'unhealthy' || cacheStatus === 'unhealthy') return 'unhealthy';
    if (wsStatus === 'degraded' || cacheStatus === 'degraded') return 'degraded';
    return 'healthy';
  }

  public getMetrics(): Map<string, Metric> {
    return new Map(this.metrics);
  }

  public getWebSocketMetrics(): WebSocketMetrics {
    return { ...this.wsMetrics };
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
}
