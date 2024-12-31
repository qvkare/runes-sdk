import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { BatchProcessResult, BatchTransfer } from '../types/rune.types';

export class RunesBatchService {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;
  private readonly validator: RunesValidator;

  constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator) {
    this.rpcClient = rpcClient;
    this.logger = logger;
    this.validator = validator;
  }

  async processBatch(transfers: BatchTransfer[]): Promise<BatchProcessResult> {
    const result: BatchProcessResult = {
      successful: [],
      failed: [],
      totalTransfers: transfers.length,
      successfulTransfers: 0,
      failedTransfers: 0,
      errors: []
    };

    for (const transfer of transfers) {
      try {
        const validationResult = this.validator.validateTransfer(transfer);
        if (!validationResult.isValid) {
          const error = new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
          result.failed.push({
            transfer,
            error
          });
          result.errors.push(error);
          result.failedTransfers++;
          continue;
        }

        const response = await this.rpcClient.call('transfer', [transfer]);
        result.successful.push({
          transfer,
          txid: response.txid
        });
        result.successfulTransfers++;
      } catch (error) {
        const processedError = error instanceof Error ? error : new Error('Unknown error occurred');
        result.failed.push({
          transfer,
          error: processedError
        });
        result.errors.push(processedError);
        result.failedTransfers++;
      }
    }

    return result;
  }
} 