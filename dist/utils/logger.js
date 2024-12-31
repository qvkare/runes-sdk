"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(context) {
        this.context = context;
    }
    debug(message, ...args) {
        console.debug(`[${this.context}] ${message}`, ...args);
    }
    info(message, ...args) {
        console.info(`[${this.context}] ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`[${this.context}] ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`[${this.context}] ${message}`, ...args);
    }
}
exports.Logger = Logger;
