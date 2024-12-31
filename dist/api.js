"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesAPI = void 0;
const rpc_client_1 = require("./utils/rpc.client");
const runes_validator_1 = require("./utils/runes.validator");
const runes_service_1 = require("./services/runes.service");
const runes_order_service_1 = require("./services/runes.order.service");
const runes_history_service_1 = require("./services/runes.history.service");
const runes_liquidity_service_1 = require("./services/runes.liquidity.service");
const runes_batch_service_1 = require("./services/runes.batch.service");
const runes_performance_service_1 = require("./services/runes.performance.service");
const logger_1 = require("./utils/logger");
class RunesAPI {
    constructor(config) {
        this.logger = config.logger || new logger_1.Logger('RunesAPI');
        this.rpcClient = new rpc_client_1.RPCClient(config.baseUrl, {
            logger: this.logger,
            timeout: config.timeout,
            maxRetries: config.maxRetries,
            retryDelay: config.retryDelay
        });
        this.validator = new runes_validator_1.RunesValidator(this.rpcClient, this.logger);
        this.service = new runes_service_1.RunesService(this.rpcClient, this.logger, this.validator);
        this.order = new runes_order_service_1.RunesOrderService(this.rpcClient, this.logger);
        this.history = new runes_history_service_1.RunesHistoryService(this.rpcClient, this.logger);
        this.liquidity = new runes_liquidity_service_1.RunesLiquidityService(this.rpcClient, this.logger);
        this.batch = new runes_batch_service_1.RunesBatchService(this.rpcClient, this.logger, this.validator);
        this.performance = new runes_performance_service_1.RunesPerformanceService(this.rpcClient, this.logger);
    }
}
exports.RunesAPI = RunesAPI;
