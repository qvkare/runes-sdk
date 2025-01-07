import { RpcClient } from '../../../types/rpc.types';
import { Logger } from '../../../types/logger.types';
import { BatchTransfer } from '../../../types/rune.types';

export class RunesBatchService {
  constructor(
    private rpcClient: RpcClient,
    private logger: Logger
  ) {}

  async processBatch(runeId: string, transfers: BatchTransfer[]): Promise<boolean> {
    try {
      const result = await this.rpcClient.call('processbatchtransfers', [runeId, transfers]);
      return result;
    } catch (error) {
      this.logger.error('Failed to process batch transfers:', error);
      throw new Error('Failed to process batch transfers');
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    try {
      const status = await this.rpcClient.call('getbatchstatus', [batchId]);
      return status;
    } catch (error) {
      this.logger.error('Failed to get batch status:', error);
      throw new Error('Failed to get batch status');
    }
  }
}
