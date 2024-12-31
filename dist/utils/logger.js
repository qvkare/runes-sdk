"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class ConsoleLogger {
    constructor(context, level = LogLevel.INFO) {
        this.context = context;
        this.level = level;
    }
    shouldLog(level) {
        return level <= this.level;
    }
    info(message) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log(`[${this.context}] ${message}`);
        }
    }
    warn(message) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`[${this.context}] ${message}`);
        }
    }
    error(message) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(`[${this.context}] ${message}`);
        }
    }
    debug(message) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(`[${this.context}] ${message}`);
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
