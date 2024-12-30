import { RunesService, BatchService } from '../src';

async function main() {
  // Initialize services
  const runesService = new RunesService({
    bitcoinRpc: {
      host: 'localhost',
      port: 8332,
      username: process.env.BTC_RPC_USER || 'user',
      password: process.env.BTC_RPC_PASS || 'pass',
    },
    network: 'testnet',
    monitoring: {
      enabled: true,
      port: 9090,
    },
  });

  const batchService = new BatchService(runesService, {
    batchSize: 10,
    processingInterval: 1000,
  });

  try {
    // Start batch processing
    console.log('Starting batch service...');
    batchService.start();

    // Create a batch
    const batchId = 'example-batch-1';

    // Add mint operations
    console.log('Adding mint operations...');
    await Promise.all([
      batchService.addMintOperation(batchId, {
        symbol: 'TEST1',
        supply: 1000000,
      }),
      batchService.addMintOperation(batchId, {
        symbol: 'TEST2',
        supply: 2000000,
      }),
    ]);

    // Add transfer operations
    console.log('Adding transfer operations...');
    await Promise.all([
      batchService.addTransferOperation(batchId, {
        symbol: 'TEST1',
        amount: 1000,
        to: 'tb1qtest1...', // Replace with actual testnet address
      }),
      batchService.addTransferOperation(batchId, {
        symbol: 'TEST2',
        amount: 2000,
        to: 'tb1qtest2...', // Replace with actual testnet address
      }),
    ]);

    // Wait for batch completion
    console.log('Waiting for batch completion...');
    const results = await batchService.waitForBatchCompletion(batchId, 30000);

    // Process results
    console.log('Batch results:');
    results.forEach((op, index) => {
      console.log(`Operation ${index + 1}:`);
      console.log('- Type:', op.type);
      console.log('- Status:', op.status);
      if (op.error) {
        console.log('- Error:', op.error);
      }
      if (op.result) {
        console.log('- Result:', op.result);
      }
    });

    // Clear completed batches
    batchService.clearCompletedBatches();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    // Stop batch processing
    batchService.stop();
  }
}

main();
