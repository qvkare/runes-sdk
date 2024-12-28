import { RPCClient } from '../utils/rpc.client';
import { RuneValidationResult } from '../types/rune.types';

export class RuneValidator {
  constructor(private readonly rpcClient: RPCClient) {}

  async validateTransfer(rune: string, amount: bigint, to: string): Promise<RuneValidationResult> {
    try {
      // Check if rune exists
      const runeExists = await this.rpcClient.call('getrune', [rune]);
      if (!runeExists) {
        return {
          valid: false,
          operations: [],
          errors: ['Rune not found']
        };
      }

      // Validate recipient address
      const addressValid = await this.rpcClient.call('validateaddress', [to]);
      if (!addressValid.isvalid) {
        return {
          valid: false,
          operations: [],
          errors: ['Invalid recipient address']
        };
      }

      // Validate amount
      if (amount <= BigInt(0)) {
        return {
          valid: false,
          operations: [],
          errors: ['Amount must be greater than 0']
        };
      }

      return {
        valid: true,
        operations: []
      };
    } catch (error) {
      return {
        valid: false,
        operations: [],
        errors: [(error as Error).message]
      };
    }
  }
} 