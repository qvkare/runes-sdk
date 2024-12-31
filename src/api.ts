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

export class RunesAPI {
  private readonly rpcClient: RPCClient;
  private readonly validator: RunesValidator;
  private readonly logger: Logger;

  public readonly service: RunesService;
  public readonly order: RunesOrderService;
  public readonly history: RunesHistoryService;
  public readonly liquidity: RunesLiquidityService;
  public readonly batch: RunesBatchService;
  public readonly performance: RunesPerformanceService;

  constructor(config: SDKConfig) {
    this.logger = config.logger || new Logger('RunesAPI');
    this.rpcClient = new RPCClient(
      config.baseUrl,
      {
        logger: this.logger,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay
      }
    );

    this.validator = new RunesValidator(this.rpcClient, this.logger);
    this.service = new RunesService(this.rpcClient, this.logger, this.validator);
    this.order = new RunesOrderService(this.rpcClient, this.logger);
    this.history = new RunesHistoryService(this.rpcClient, this.logger);
    this.liquidity = new RunesLiquidityService(this.rpcClient, this.logger);
    this.batch = new RunesBatchService(this.rpcClient, this.logger, this.validator);
    this.performance = new RunesPerformanceService(this.rpcClient, this.logger);
  }
} 