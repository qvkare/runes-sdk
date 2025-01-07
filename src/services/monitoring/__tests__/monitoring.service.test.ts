import { MonitoringService } from '../monitoring.service';
import { Logger } from '../../logger/logger.service';
import { Metric, MetricType } from '../../../types/monitoring.types';

jest.mock('../../logger/logger.service');

describe('MonitoringService', () => {
  let service: MonitoringService;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    service = new MonitoringService(mockLogger);
  });

  describe('Metric Recording', () => {
    it('should record metrics correctly', () => {
      const metric: Metric = {
        name: 'test_metric',
        type: MetricType.COUNTER,
        value: 100,
        timestamp: Date.now(),
      };

      service.recordMetric(metric);
      const metrics = service.getMetrics();

      expect(metrics.get('test_metric')).toEqual(metric);
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('WebSocket Metrics', () => {
    it('should update websocket metrics', () => {
      const update = {
        messageCount: 100,
        errorCount: 5,
        activeConnections: 10,
      };

      service.updateWebSocketMetrics(update);
      const metrics = service.getWebSocketMetrics();

      expect(metrics.messageCount).toBe(100);
      expect(metrics.errorCount).toBe(5);
      expect(metrics.activeConnections).toBe(10);
    });

    it('should track memory usage', () => {
      service.updateWebSocketMetrics({});
      const metrics = service.getWebSocketMetrics();

      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.memoryUsage.heapTotal).toBeGreaterThan(0);
      expect(metrics.memoryUsage.heapUsed).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should update performance metrics', () => {
      const update = {
        requestsPerSecond: 50,
        averageResponseTime: 100,
        errorRate: 0.01,
      };

      service.updatePerformanceMetrics(update);
      const metrics = service.getPerformanceMetrics();

      expect(metrics.requestsPerSecond).toBe(50);
      expect(metrics.averageResponseTime).toBe(100);
      expect(metrics.errorRate).toBe(0.01);
    });
  });

  describe('System Health', () => {
    it('should report healthy status when metrics are good', () => {
      service.updateWebSocketMetrics({
        messageCount: 1000,
        errorCount: 10,
      });

      service.updatePerformanceMetrics({
        cacheHitRate: 80,
      });

      const health = service.getSystemHealth();
      expect(health.status).toBe('healthy');
      expect(health.components.websocket.status).toBe('healthy');
      expect(health.components.cache.status).toBe('healthy');
    });

    it('should report degraded status when metrics are concerning', () => {
      service.updateWebSocketMetrics({
        messageCount: 1000,
        errorCount: 60,
      });

      const health = service.getSystemHealth();
      expect(health.status).toBe('degraded');
    });

    it('should report unhealthy status when metrics are bad', () => {
      service.updateWebSocketMetrics({
        messageCount: 1000,
        errorCount: 150,
      });

      const health = service.getSystemHealth();
      expect(health.status).toBe('unhealthy');
    });
  });
});
