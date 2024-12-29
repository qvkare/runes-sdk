import { RPCClient } from '../utils/rpc.client';
import { Logger } from '../utils/logger';

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RPCClient,
    private readonly logger: Logger
  ) {}

  async verifyRune(runeId: string): Promise<boolean> {
    try {
      this.logger.info('Verifying rune:', runeId);
      const response = await this.rpcClient.call<{ verified: boolean }>('verifyrune', [runeId]);
      
      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }
      
      if (!response.result.verified) {
        this.logger.warn('Rune verification failed:', runeId);
      }
      
      return response.result.verified;
    } catch (error) {
      this.logger.error('Failed to verify rune:', error);
      throw new Error('Failed to verify rune');
    }
  }

  async checkSecurity(runeId: string): Promise<{ secure: boolean; issues: string[] }> {
    try {
      this.logger.info('Checking security for rune:', runeId);
      const response = await this.rpcClient.call<{ secure: boolean; issues: string[] }>('checksecurity', [runeId]);
      
      if (!response.result) {
        throw new Error('Invalid response from RPC');
      }
      
      if (!response.result.secure) {
        this.logger.warn('Security issues found for rune:', runeId, response.result.issues);
      }
      
      return response.result;
    } catch (error) {
      this.logger.error('Failed to check security:', error);
      throw new Error('Failed to check security');
    }
  }
} 