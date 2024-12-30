import { RPCClient } from '../utils/rpc.client';
import { RunesValidator } from '../utils/runes.validator';
import { Logger } from '../utils/logger';
import { BatchOperation, BatchResult, CreateRuneParams, TransferRuneParams, BatchOperationResult } from '../types';
import { BitcoinCoreService } from '../services/bitcoin.core.service';

export class RunesBatchService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly validator: RunesValidator,
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger
  ) {}

  async executeBatch(operations: BatchOperation[]): Promise<BatchOperationResult[]> {
    if (operations.length === 0) {
      throw new Error('Batch operations cannot be empty');
    }

    const results: BatchOperationResult[] = [];

    for (const operation of operations) {
      try {
        const validationResult = await this.validator.validateBatchOperation(operation);
        if (!validationResult.isValid) {
          results.push({
            success: false,
            error: validationResult.errors.join(', '),
          });
          continue;
        }

        if (operation.type === 'create') {
          const result = await this.createRune(operation.params);
          results.push({
            success: true,
            txId: result.txId,
          });
        } else if (operation.type === 'transfer') {
          const result = await this.transferRune(operation.params);
          results.push({
            success: true,
            txId: result.txId,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async getBatchStatus(batchId: string): Promise<BatchResult> {
    try {
      const operations = await this.rpcClient.call('getbatchstatus', [batchId]);
      
      if (!operations) {
        throw new Error('Invalid batch ID');
      }

      const completedOperations = operations.filter((op: BatchOperation) => op.status === 'completed').length;
      const failedOperations = operations.filter((op: BatchOperation) => op.status === 'failed').length;
      const pendingOperations = operations.filter((op: BatchOperation) => op.status === 'pending').length;

      return {
        operations,
        totalOperations: operations.length,
        completedOperations,
        failedOperations,
        pendingOperations,
      };
    } catch (error) {
      this.logger.error('Failed to get batch status:', error);
      throw error;
    }
  }

  private async processCreateOperation(params: CreateRuneParams): Promise<BatchResult> {
    const validationResult = await this.validator.validateRuneCreation(params);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join(', '));
    }

    const response = await this.rpcClient.call('createrune', [params]);
    return {
      id: response.id,
      success: true,
      result: response,
    };
  }

  private async processTransferOperation(params: TransferRuneParams): Promise<BatchResult> {
    const validationResult = await this.validator.validateTransfer(params);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join(', '));
    }

    const response = await this.rpcClient.call('transferrune', [params]);
    return {
      id: response.id,
      success: true,
      result: response,
    };
  }
}
