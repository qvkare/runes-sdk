import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BatchHandler } from '../../services/transaction/batch.handler';
import { TransactionService } from '../../services/transaction/transaction.service';
import { RpcClient as IRpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { Transaction } from '../../types/transaction.types';

describe('Batch Processing Integration', () => {
  let batchHandler: BatchHandler;
  let transactionService: TransactionService;
  let rpcClient: IRpcClient;
  let logger: Logger;

  beforeAll(async () => {
    // Setup real RPC client (could be pointed to testnet)
    rpcClient = {
      call: jest.fn(),
      sendTransaction: jest.fn(),
      getTransaction: jest.fn()
    };

    logger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn()
    };

    transactionService = new TransactionService(rpcClient, logger);
    batchHandler = new BatchHandler(transactionService, logger);
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  it('should process a batch of transactions end-to-end', async () => {
    const transactions: Transaction[] = [
      {
        id: 'test-tx-1',
        type: 'mint',
        data: { amount: '100' },
        timestamp: Date.now()
      },
      {
        id: 'test-tx-2',
        type: 'transfer',
        data: { amount: '50' },
        timestamp: Date.now()
      }
    ];

    // Mock RPC responses
    (rpcClient.call as jest.Mock).mockImplementation((method, params) => {
      if (method === 'processtransaction') {
        return Promise.resolve({ txid: params[0].id });
      }
      return Promise.reject(new Error('Unknown method'));
    });

    const result = await batchHandler.processBatch(transactions);

    expect(result.successful).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
    expect(rpcClient.call).toHaveBeenCalledTimes(2);
    expect(logger.info).toHaveBeenCalledWith(
      'Processing batch of 2 transactions'
    );
  });

  it('should handle mixed success and failure scenarios', async () => {
    const transactions: Transaction[] = [
      {
        id: 'success-tx',
        type: 'mint',
        data: { amount: '100' },
        timestamp: Date.now()
      },
      {
        id: 'fail-tx',
        type: 'transfer',
        data: { amount: '999999' }, // Amount too high
        timestamp: Date.now()
      }
    ];

    // Mock RPC responses with mixed results
    (rpcClient.call as jest.Mock).mockImplementation((method, params) => {
      if (params[0].id === 'success-tx') {
        return Promise.resolve({ txid: 'success-tx' });
      }
      return Promise.reject(new Error('Insufficient funds'));
    });

    const result = await batchHandler.processBatch(transactions);

    expect(result.successful).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(result.failed).toContain('fail-tx');
    expect(logger.error).toHaveBeenCalled();
  });
}); 