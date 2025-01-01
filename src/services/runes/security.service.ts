import { RpcClient } from '../../utils/rpc.client';
import { Logger } from '../../types/logger.types';

interface SecurityVerification {
  txId: string;
  isValid: boolean;
  signatures: string[];
  timestamp: number;
  reason?: string;
}

interface SecurityCheck {
  runeId: string;
  isSecure: boolean;
  vulnerabilities: string[];
  lastAudit: number;
}

export class RunesSecurityService {
  constructor(
    private readonly rpcClient: RpcClient,
    private readonly logger: Logger
  ) {}

  async verifyTransaction(txId: string): Promise<SecurityVerification> {
    try {
      if (!txId) {
        throw new Error('Transaction ID is required');
      }

      const response = await this.rpcClient.call('verifytransaction', [txId]);
      if (!response || typeof response.isValid !== 'boolean') {
        throw new Error('Invalid response from RPC');
      }

      return {
        txId,
        isValid: response.isValid,
        signatures: response.signatures || [],
        timestamp: response.timestamp,
        reason: response.reason,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to verify transaction: ${error.message}`);
        throw new Error(`Failed to verify transaction: ${error.message}`);
      } else {
        this.logger.error('Failed to verify transaction: Unknown error');
        throw new Error('Failed to verify transaction: Unknown error');
      }
    }
  }

  async checkRuneSecurity(runeId: string): Promise<SecurityCheck> {
    try {
      if (!runeId) {
        throw new Error('Rune ID is required');
      }

      const response = await this.rpcClient.call('checkrunesecurity', [runeId]);
      if (!response || typeof response.isSecure !== 'boolean') {
        throw new Error('Invalid response from RPC');
      }

      return {
        runeId: response.runeId,
        isSecure: response.isSecure,
        vulnerabilities: response.vulnerabilities || [],
        lastAudit: response.lastAudit,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to check rune security: ${error.message}`);
        throw new Error(`Failed to check rune security: ${error.message}`);
      } else {
        this.logger.error('Failed to check rune security: Unknown error');
        throw new Error('Failed to check rune security: Unknown error');
      }
    }
  }
}
