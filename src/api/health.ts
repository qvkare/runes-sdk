import express from 'express';
import { RPCClient } from '../utils/rpc.client';
import { collectMetrics, updateSystemMetrics } from '../config/prometheus.config';
import { Logger } from '../utils/logger';

const router = express.Router();
const logger = new Logger('HealthCheck');

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    bitcoin_node: {
      status: 'up' | 'down';
      block_height?: number;
      sync_status?: number;
    };
    api: {
      status: 'up' | 'down';
      uptime: number;
    };
    system: {
      memory_usage: number;
      cpu_usage: number;
    };
  };
}

export function initializeHealthCheck(rpcClient: RPCClient): express.Router {
  // Basit health check
  router.get('/health', async (req, res) => {
    try {
      const status: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.0.0',
        services: {
          bitcoin_node: {
            status: 'up',
          },
          api: {
            status: 'up',
            uptime: process.uptime(),
          },
          system: {
            memory_usage: process.memoryUsage().heapUsed,
            cpu_usage: process.cpuUsage().user / 1000000,
          },
        },
      };

      // Bitcoin node durumunu kontrol et
      try {
        const blockchainInfo = await rpcClient.call('getblockchaininfo');
        if (blockchainInfo.result) {
          status.services.bitcoin_node.block_height = blockchainInfo.result.blocks;
          status.services.bitcoin_node.sync_status = blockchainInfo.result.verificationprogress;
        }
      } catch (error) {
        status.services.bitcoin_node.status = 'down';
        status.status = 'unhealthy';
        logger.error('Bitcoin node health check failed:', error);
      }

      // Sistem metriklerini güncelle
      updateSystemMetrics();

      res.json(status);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Detaylı health check
  router.get('/health/details', async (req, res) => {
    try {
      const [blockchainInfo, networkInfo, mempoolInfo] = await Promise.all([
        rpcClient.call('getblockchaininfo'),
        rpcClient.call('getnetworkinfo'),
        rpcClient.call('getmempoolinfo'),
      ]);

      const details = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.0.0',
        bitcoin_node: {
          ...blockchainInfo.result,
          network: networkInfo.result,
          mempool: mempoolInfo.result,
        },
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          uptime: process.uptime(),
          node_version: process.version,
          platform: process.platform,
        },
      };

      res.json(details);
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Prometheus metrics endpoint
  router.get('/metrics', async (req, res) => {
    try {
      const metrics = await collectMetrics();
      res.set('Content-Type', promClient.register.contentType);
      res.end(metrics);
    } catch (error) {
      logger.error('Metrics collection failed:', error);
      res.status(500).send('Error collecting metrics');
    }
  });

  return router;
}
