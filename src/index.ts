/**
 * @packageDocumentation
 * @module runes-sdk
 */

import { RunesService } from './services/runes.service';
import { RunesSecurityService } from './services/runes.security.service';
import { BitcoinCoreService } from './services/bitcoin-core.service';
import { RPCClientConfig } from './types';
import { defaultLogger } from './utils/logger';
import { RunesBatchService } from './services/runes.batch.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RunesValidator } from './services/runes.validator';

export class RunesSDK {
  public readonly runes: RunesService;
  public readonly security: RunesSecurityService;
  private readonly bitcoinCore: BitcoinCoreService;

  constructor(config: RPCClientConfig) {
    this.bitcoinCore = new BitcoinCoreService(config, defaultLogger);
    const batchService = new RunesBatchService(this.bitcoinCore, defaultLogger);
    const historyService = new RunesHistoryService(this.bitcoinCore, defaultLogger);
    const validator = new RunesValidator(this.bitcoinCore, defaultLogger);

    this.runes = new RunesService(
      this.bitcoinCore,
      defaultLogger,
      batchService,
      historyService,
      validator
    );
    this.security = new RunesSecurityService(this.bitcoinCore, defaultLogger);
  }
}

export * from './types';
export * from './errors';
export default RunesSDK;
