import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunesValidator } from '../utils/runes.validator';
import { BatchSubmissionResult } from '../types';

interface Transfer {
  runeId: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
}

export class RunesBatchService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger,
    private readonly validator: RunesValidator
  ) {}

  async submitBatch(transfers: Transfer[]): Promise<BatchSubmissionResult> {
    this.logger.info('Validating batch transfers:', transfers);

    for (const transfer of transfers) {
      const validationResult = await this.validator.validateTransfer(transfer);
      if (!validationResult.isValid) {
        this.logger.warn('Transfer validation failed:', validationResult.errors);
        throw new Error(validationResult.errors[0]);
      }
    }

    try {
      this.logger.info('Submitting batch:', transfers);
      const response = await this.rpcClient.call<BatchSubmissionResult>('submitbatch', [transfers]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to submit batch:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to submit batch');
    }
  }

  async getBatchStatus(batchId: string): Promise<BatchSubmissionResult> {
    try {
      this.logger.info('Getting batch status:', batchId);
      const response = await this.rpcClient.call<BatchSubmissionResult>('getbatchstatus', [batchId]);

      if (!response.result) {
        this.logger.error('Invalid response from RPC');
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to get batch status:', error);
      if (error instanceof Error && error.message === 'Invalid response from RPC') {
        throw error;
      }
      throw new Error('Failed to get batch status');
    }
  }
} 