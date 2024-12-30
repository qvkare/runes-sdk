import { BitcoinCoreService } from './bitcoin-core.service';
import { RunesBatchService } from './runes.batch.service';
import { RunesHistoryService } from './runes.history.service';
import { RunesValidator } from './runes.validator';
import { CreateRuneParams, TransferRuneParams, RuneTransaction } from '../types';
import { Logger } from '../utils/logger';
import { RunesSecurityService } from './runes.security.service';

export class RunesService {
  constructor(
    private readonly bitcoinCore: BitcoinCoreService,
    private readonly logger: Logger,
    private readonly historyService: RunesHistoryService,
    private readonly securityService: RunesSecurityService,
    private readonly batchService: RunesBatchService,
    private readonly validator: RunesValidator
  ) {}

  async createRune(params: CreateRuneParams) {
    const validation = await this.validator.validateRuneCreation(params);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.batchService.createRune(params);
  }

  async transferRune(params: TransferRuneParams) {
    const validation = await this.validator.validateTransfer(params);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.batchService.transferRune(params);
  }

  async getRuneHistory(runeId: string): Promise<RuneTransaction[]> {
    const validation = await this.validator.validateRuneId(runeId);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    return this.historyService.getRuneHistory(runeId);
  }

  async getRuneBalance(runeId: string, address: string): Promise<number> {
    const runeValidation = await this.validator.validateRuneId(runeId);
    if (!runeValidation.isValid) {
      throw new Error(runeValidation.errors.join(', '));
    }

    const addressValidation = await this.validator.validateAddress(address);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.errors.join(', '));
    }

    return this.batchService.getRuneBalance(runeId, address);
  }
}
