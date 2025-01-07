import { RpcClient as IRpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';
import { RuneMetadata, RuneValidationResult } from '../../types/rune.types';

/**
 * Service for handling Ord protocol specific operations
 * Provides functionality for validating and processing Rune transactions
 */
export class OrdService {
  constructor(
    private readonly rpcClient: IRpcClient,
    private readonly logger: Logger
  ) {}

  /**
   * Validates a transaction against Ord protocol rules
   * @param txid Transaction ID to validate
   * @returns Validation result with details
   */
  async validateTransaction(txid: string): Promise<RuneValidationResult> {
    try {
      const validation = await this.rpcClient.call('validateordtx', [txid]);
      return {
        isValid: validation.valid,
        details: validation.details,
        timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error('Error validating Ord transaction:', error);
      throw new Error('Failed to validate Ord transaction');
    }
  }

  /**
   * Retrieves metadata for a specific rune
   * @param runeId Unique identifier of the rune
   * @returns Rune metadata including supply and attributes
   */
  async getRuneMetadata(runeId: string): Promise<RuneMetadata> {
    try {
      const metadata = await this.rpcClient.call('getrunemetadata', [runeId]);
      return {
        id: runeId,
        name: metadata.name || '',
        symbol: metadata.symbol || '',
        decimals: metadata.decimals || 0,
        supply: metadata.supply || '0',
        description: metadata.description,
        icon: metadata.icon,
        website: metadata.website,
        attributes: metadata.attributes,
        socials: metadata.socials
      };
    } catch (error) {
      this.logger.error('Error fetching rune metadata:', error);
      throw new Error('Failed to fetch rune metadata');
    }
  }

  /**
   * Synchronizes local state with Ord node
   * @returns Current sync status
   */
  async syncWithNode(): Promise<boolean> {
    try {
      const syncStatus = await this.rpcClient.call('syncordnode', []);
      this.logger.info('Ord node sync status:', syncStatus);
      return syncStatus.synchronized;
    } catch (error) {
      this.logger.error('Error syncing with Ord node:', error);
      throw new Error('Failed to sync with Ord node');
    }
  }
} 