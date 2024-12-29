import { RPCClient } from './utils/rpc.client';
import { Logger } from './utils/logger';
import { RunesValidator } from './utils/runes.validator';
import { RunesService } from './services/runes.service';
import { RunesOrderService } from './services/runes.order.service';
import { RunesSecurityService } from './services/runes.security.service';
import { RunesPerformanceService } from './services/runes.performance.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RunesLiquidityService } from './services/runes.liquidity.service';
import { RunesBatchService } from './services/runes.batch.service';

export interface SDKConfig {
  baseUrl: string;
  logger?: Logger;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export class RunesSDK {
  public readonly rpcClient: RPCClient;
  public readonly validator: RunesValidator;
  public readonly runesService: RunesService;
  public readonly orderService: RunesOrderService;
  public readonly securityService: RunesSecurityService;
  public readonly performanceService: RunesPerformanceService;
  public readonly historyService: RunesHistoryService;
  public readonly liquidityService: RunesLiquidityService;
  public readonly batchService: RunesBatchService;

  constructor(config: SDKConfig) {
    const logger = config.logger || new Logger('RunesSDK');
    
    this.rpcClient = new RPCClient(
      config.baseUrl,
      {
        logger,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        retryDelay: config.retryDelay
      }
    );
    
    this.validator = new RunesValidator(this.rpcClient, logger);
    this.runesService = new RunesService(this.rpcClient, logger, this.validator);
    this.orderService = new RunesOrderService(this.rpcClient, logger);
    this.securityService = new RunesSecurityService(this.rpcClient, logger);
    this.performanceService = new RunesPerformanceService(this.rpcClient, logger);
    this.historyService = new RunesHistoryService(this.rpcClient, logger);
    this.liquidityService = new RunesLiquidityService(this.rpcClient, logger);
    this.batchService = new RunesBatchService(this.rpcClient, logger, this.validator);
  }
}

export * from './types';
export * from './utils/logger';
export * from './utils/rpc.client';
export * from './utils/runes.validator';
export * from './services/runes.service';
export * from './services/runes.order.service';
export * from './services/runes.security.service';
export * from './services/runes.performance.service';
export * from './services/runes.history.service';
export * from './services/runes.liquidity.service';
export * from './services/runes.batch.service'; 