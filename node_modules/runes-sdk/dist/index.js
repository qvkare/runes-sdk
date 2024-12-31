"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesSDK = void 0;
const rpc_client_1 = require("./utils/rpc.client");
const logger_1 = require("./utils/logger");
const runes_validator_1 = require("./utils/runes.validator");
const runes_service_1 = require("./services/runes.service");
const runes_order_service_1 = require("./services/runes.order.service");
const runes_security_service_1 = require("./services/runes.security.service");
const runes_performance_service_1 = require("./services/runes.performance.service");
const runes_history_service_1 = require("./services/runes.history.service");
const runes_liquidity_service_1 = require("./services/runes.liquidity.service");
const runes_batch_service_1 = require("./services/runes.batch.service");
class RunesSDK {
    constructor(config) {
        const logger = config.logger || new logger_1.Logger('RunesSDK');
        this.rpcClient = new rpc_client_1.RPCClient(config.baseUrl, {
            logger,
            timeout: config.timeout,
            maxRetries: config.maxRetries,
            retryDelay: config.retryDelay
        });
        this.validator = new runes_validator_1.RunesValidator(this.rpcClient, logger);
        this.runesService = new runes_service_1.RunesService(this.rpcClient, logger, this.validator);
        this.orderService = new runes_order_service_1.RunesOrderService(this.rpcClient, logger);
        this.securityService = new runes_security_service_1.RunesSecurityService(this.rpcClient, logger);
        this.performanceService = new runes_performance_service_1.RunesPerformanceService(this.rpcClient, logger);
        this.historyService = new runes_history_service_1.RunesHistoryService(this.rpcClient, logger);
        this.liquidityService = new runes_liquidity_service_1.RunesLiquidityService(this.rpcClient, logger);
        this.batchService = new runes_batch_service_1.RunesBatchService(this.rpcClient, logger, this.validator);
    }
}
exports.RunesSDK = RunesSDK;
__exportStar(require("./types"), exports);
__exportStar(require("./utils/logger"), exports);
__exportStar(require("./utils/rpc.client"), exports);
__exportStar(require("./utils/runes.validator"), exports);
__exportStar(require("./services/runes.service"), exports);
__exportStar(require("./services/runes.order.service"), exports);
__exportStar(require("./services/runes.security.service"), exports);
__exportStar(require("./services/runes.performance.service"), exports);
__exportStar(require("./services/runes.history.service"), exports);
__exportStar(require("./services/runes.liquidity.service"), exports);
__exportStar(require("./services/runes.batch.service"), exports);
