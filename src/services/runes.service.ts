import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';
import { RunesValidator } from '../utils/runes.validator';
import { RuneTransfer } from '../types/rune.types';

export class RunesService {
  private readonly rpcClient: RPCClient;
  private readonly logger: Logger;
  private readonly validator: RunesValidator;

  constructor(rpcClient: RPCClient, logger: Logger, validator: RunesValidator) {
    this.rpcClient = rpcClient;
    this.logger = logger;
    this.validator = validator;
  }

  async transferRune(transfer: RuneTransfer): Promise<any> {
    try {
      const validationResult = this.validator.validateTransfer(transfer);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors[0] || 'Invalid transfer');
      }

      const response = await this.rpcClient.call('transfer', [transfer]);
      return response;
    } catch (error) {
      const errorMessage = `Failed to transfer rune: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
} 