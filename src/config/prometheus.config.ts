import * as promClient from 'prom-client';

// Metrics tanımlamaları
export const metrics = {
  // İşlem metrikleri
  transactionCounter: new promClient.Counter({
    name: 'runes_transactions_total',
    help: 'Total number of Runes transactions',
    labelNames: ['type', 'status'],
  }),

  transactionDuration: new promClient.Histogram({
    name: 'runes_transaction_duration_seconds',
    help: 'Duration of Runes transactions',
    labelNames: ['type'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),

  // RPC metrikleri
  rpcRequestCounter: new promClient.Counter({
    name: 'runes_rpc_requests_total',
    help: 'Total number of RPC requests',
    labelNames: ['method', 'status'],
  }),

  rpcRequestDuration: new promClient.Histogram({
    name: 'runes_rpc_request_duration_seconds',
    help: 'Duration of RPC requests',
    labelNames: ['method'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),

  // Sistem metrikleri
  memoryUsage: new promClient.Gauge({
    name: 'runes_memory_usage_bytes',
    help: 'Memory usage in bytes',
  }),

  cpuUsage: new promClient.Gauge({
    name: 'runes_cpu_usage_percent',
    help: 'CPU usage percentage',
  }),

  // API metrikleri
  apiRequestCounter: new promClient.Counter({
    name: 'runes_api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'endpoint', 'status'],
  }),

  apiRequestDuration: new promClient.Histogram({
    name: 'runes_api_request_duration_seconds',
    help: 'Duration of API requests',
    labelNames: ['method', 'endpoint'],
    buckets: [0.05, 0.1, 0.5, 1, 2],
  }),
};

// Default metrik koleksiyonunu başlat
promClient.collectDefaultMetrics();

// Metrik toplama fonksiyonu
export async function collectMetrics(): Promise<string> {
  return await promClient.register.metrics();
}

// Sistem metriklerini güncelleme
export function updateSystemMetrics(): void {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage.set(memUsage.heapUsed);

  const startUsage = process.cpuUsage();
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = (endUsage.user + endUsage.system) / 1000000; // Convert to seconds
    metrics.cpuUsage.set(totalUsage);
  }, 100);
}

// Metrik yardımcı fonksiyonları
export function recordTransaction(type: string, status: string, duration: number): void {
  metrics.transactionCounter.labels(type, status).inc();
  metrics.transactionDuration.labels(type).observe(duration);
}

export function recordRPCRequest(method: string, status: string, duration: number): void {
  metrics.rpcRequestCounter.labels(method, status).inc();
  metrics.rpcRequestDuration.labels(method).observe(duration);
}

export function recordAPIRequest(
  method: string,
  endpoint: string,
  status: string,
  duration: number
): void {
  metrics.apiRequestCounter.labels(method, endpoint, status).inc();
  metrics.apiRequestDuration.labels(method, endpoint).observe(duration);
}
