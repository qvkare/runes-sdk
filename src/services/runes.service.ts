import { Logger } from '../utils/logger';
import { RPCClient } from '../utils/rpc.client';
import { RunePerformanceStats } from '../types';
import { RunesValidator } from '../utils/runes.validator';
import { Transfer } from '../utils/runes.validator';

export class RunesService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger,
    private readonly validator: RunesValidator
  ) {}

  async getRuneInfo(runeId: string): Promise<RunePerformanceStats> {
    try {
      this.logger.info('Getting rune info for:', runeId);
      const response = await this.rpcClient.call<RunePerformanceStats>('getruneinfo', [runeId]);

      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to get rune info:', error);
      throw new Error('Failed to get rune info');
    }
  }

  async transferRune(transfer: Transfer): Promise<{ txId: string }> {
    const validationResult = await this.validator.validateTransfer(transfer);

    if (!validationResult.isValid) {
      this.logger.warn('Transfer validation failed:', validationResult.errors);
      throw new Error(validationResult.errors[0]);
    }

    try {
      this.logger.info('Transferring rune:', transfer);
      const response = await this.rpcClient.call<{ txId: string }>('transferrune', [
        transfer.runeId,
        transfer.amount,
        transfer.fromAddress,
        transfer.toAddress
      ]);

      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }

      return response.result;
    } catch (error) {
      this.logger.error('Failed to transfer rune:', error);
      throw new Error('Failed to transfer rune');
    }
  }
} 