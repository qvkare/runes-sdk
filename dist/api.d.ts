import { RunesService } from './services/runes.service';
import { RunesOrderService } from './services/runes.order.service';
import { RunesHistoryService } from './services/runes.history.service';
import { RunesLiquidityService } from './services/runes.liquidity.service';
import { RunesBatchService } from './services/runes.batch.service';
import { RunesPerformanceService } from './services/runes.performance.service';
import { SDKConfig } from './types';
export declare class RunesAPI {
    private readonly rpcClient;
    private readonly validator;
    private readonly logger;
    readonly service: RunesService;
    readonly order: RunesOrderService;
    readonly history: RunesHistoryService;
    readonly liquidity: RunesLiquidityService;
    readonly batch: RunesBatchService;
    readonly performance: RunesPerformanceService;
    constructor(config: SDKConfig);
}
