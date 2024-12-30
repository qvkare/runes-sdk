import { RPCClient } from './utils/rpc.client';
import { RunesValidator } from './utils/runes.validator';
import { RunesService } from './services/runes.service';
import { RunesOrderService } from './services/runes.order.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RunesLiquidityService } from './services/runes.liquidity.service';
import { RunesBatchService } from './services/runes.batch.service';
import { RunesPerformanceService } from './services/runes.performance.service';
import { Logger } from './utils/logger';
import { SDKConfig } from './types';
import { BitcoinCoreService } from './services/bitcoin.core.service';
import { RunesSecurityService } from './services/runes.security.service';

export class RunesAPI {
  private readonly rpcClient: RPCClient;
  private readonly validator: RunesValidator;
  private readonly logger: Logger;

  public readonly runes: RunesService;
  public readonly security: RunesSecurityService;
  public readonly order: RunesOrderService;
  public readonly history: RunesHistoryService;
  public readonly liquidity: RunesLiquidityService;
  public readonly batch: RunesBatchService;
  public readonly performance: RunesPerformanceService;

  constructor(config: SDKConfig) {
    this.logger = config.logger || console;
    this.rpcClient = new RPCClient({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      maxRetries: config.maxRetries,
      logger: this.logger,
    });

    const bitcoinCore = new BitcoinCoreService(this.rpcClient, this.logger);
    this.validator = new RunesValidator(bitcoinCore, this.logger);

    this.batch = new RunesBatchService(bitcoinCore, this.logger);
    this.history = new RunesHistoryService(bitcoinCore, this.logger);
    this.security = new RunesSecurityService(bitcoinCore, this.logger);
    this.order = new RunesOrderService(bitcoinCore, this.logger);
    this.liquidity = new RunesLiquidityService(bitcoinCore, this.logger);
    this.performance = new RunesPerformanceService(bitcoinCore, this.logger);

    this.runes = new RunesService(
      this.validator,
      this.batch,
      this.history,
      this.security,
      this.logger
    );
  }
}
