import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';
import { BatchTransfer } from '../../types/rune.types';

export class RunesBatchService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async batchTransfer(transfers: BatchTransfer[]): Promise<string[]> {
    try {
      const result = await this.rpcClient.call('batchrunetransfer', [transfers]);
      return result.txids;
    } catch (error) {
      this.logger.error(`Failed to execute batch transfer: ${error}`);
      throw new Error(`Failed to execute batch transfer: ${error}`);
    }
  }

  async getBatchStatus(batchId: string): Promise<any> {
    try {
      return await this.rpcClient.call('getbatchstatus', [batchId]);
    } catch (error) {
      this.logger.error(`Failed to get batch status: ${error}`);
      throw new Error(`Failed to get batch status: ${error}`);
    }
  }
}
