"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.OrderType = void 0;
var OrderType;
(function (OrderType) {
    OrderType["BUY"] = "buy";
    OrderType["SELL"] = "sell";
})(OrderType = exports.OrderType || (exports.OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["OPEN"] = "open";
    OrderStatus["FILLED"] = "filled";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
