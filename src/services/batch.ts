import { BatchOperation, BatchOperationResult } from '../types/batch.types';

export class BatchService {
  constructor(
    private readonly validator: (operation: BatchOperation) => Promise<boolean>,
    private readonly processor: (operation: BatchOperation) => Promise<BatchOperationResult>
  ) {}

  async validateOperation(operation: BatchOperation): Promise<boolean> {
    return this.validator(operation);
  }

  async processBatch(operations: BatchOperation[]): Promise<BatchOperationResult[]> {
    if (operations.length === 0) {
      throw new Error('Batch operations cannot be empty');
    }

    const results: BatchOperationResult[] = [];

    for (const operation of operations) {
      try {
        const isValid = await this.validateOperation(operation);
        if (!isValid) {
          results.push({
            success: false,
            error: 'Invalid operation',
          });
          continue;
        }

        const result = await this.processor(operation);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}
