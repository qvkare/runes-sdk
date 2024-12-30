import { MonitoringService } from '../src';

async function main() {
  // Initialize monitoring service
  const monitoring = new MonitoringService(9090);

  // Track custom metrics
  monitoring.trackTransaction('mint', 'TEST', 'success');
  monitoring.trackTransactionDuration('mint', 1500); // 1.5 seconds

  monitoring.updateUtxoCount('TEST', 5);
  monitoring.updateBalance('TEST', 'tb1qtest...', 1000);

  // Log different levels
  monitoring.logInfo('Application started', {
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });

  monitoring.logDebug('Processing transaction', {
    txid: '1234...',
    type: 'mint',
  });

  monitoring.logWarning('High memory usage', {
    memoryUsage: process.memoryUsage(),
  });

  try {
    throw new Error('Example error');
  } catch (error) {
    monitoring.logError('Transaction failed', error, {
      operation: 'mint',
      params: {
        symbol: 'TEST',
        supply: 1000000,
      },
    });
    monitoring.trackError('mint', 'TRANSACTION_FAILED');
  }

  // Keep the process running to serve metrics
  console.log('Monitoring server running on port 9090');
  console.log('Available endpoints:');
  console.log('- Metrics: http://localhost:9090/metrics');
  console.log('- Health: http://localhost:9090/health');

  // Prevent the process from exiting
  process.stdin.resume();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down monitoring server...');
    process.exit(0);
  });
}

main();
