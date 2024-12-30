import express from 'express';
import { RPCClient } from '../utils/rpc.client';
import { initializeHealthCheck } from './health';
import { recordAPIRequest } from '../config/prometheus.config';

const router = express.Router();

export function initializeAPI(rpcClient: RPCClient): express.Router {
  // Health check ve metrics endpoint'leri
  router.use('/', initializeHealthCheck(rpcClient));

  // API request metriklerini kaydet
  router.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      recordAPIRequest(req.method, req.path, res.statusCode.toString(), duration);
    });
    next();
  });

  // Diğer API endpoint'leri buraya eklenecek
  // ...

  return router;
}
