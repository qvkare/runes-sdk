"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunesSDK = exports.RunesHistoryService = exports.RunesBatchService = exports.RunesValidator = exports.RPCClient = void 0;
const rpc_client_1 = require("./utils/rpc.client");
Object.defineProperty(exports, "RPCClient", { enumerable: true, get: function () { return rpc_client_1.RPCClient; } });
const runes_validator_1 = require("./utils/runes.validator");
Object.defineProperty(exports, "RunesValidator", { enumerable: true, get: function () { return runes_validator_1.RunesValidator; } });
const runes_batch_service_1 = require("./services/runes.batch.service");
Object.defineProperty(exports, "RunesBatchService", { enumerable: true, get: function () { return runes_batch_service_1.RunesBatchService; } });
const runes_history_service_1 = require("./services/runes.history.service");
Object.defineProperty(exports, "RunesHistoryService", { enumerable: true, get: function () { return runes_history_service_1.RunesHistoryService; } });
class RunesSDK {
    constructor(host, username, password, logger) {
        if (!host || !username || !password) {
            throw new Error('Invalid configuration: host, username, and password are required');
        }
        this.logger = logger;
        this.rpcClient = new rpc_client_1.RPCClient(host, username, password, logger);
        this.validator = new runes_validator_1.RunesValidator(this.rpcClient, logger);
        this.batchService = new runes_batch_service_1.RunesBatchService(this.rpcClient, this.logger, this.validator);
        this.historyService = new runes_history_service_1.RunesHistoryService(this.rpcClient, logger);
    }
    async getTransactionHistory(address, limit, offset) {
        return this.historyService.getTransactionHistory(address, limit, offset);
    }
    async getTransaction(txid) {
        return this.historyService.getTransaction(txid);
    }
    async processBatch(transfers) {
        return this.batchService.processBatch(transfers);
    }
}
exports.RunesSDK = RunesSDK;
