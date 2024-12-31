"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIService = void 0;
class APIService {
    constructor(config) {
        this.baseUrl = `${config.ordServer}/api/v1`;
        this.timeout = config.timeout || 30000;
        this.retryAttempts = config.retryAttempts || 3;
    }
    async fetch(path, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }
        finally {
            clearTimeout(timeoutId);
        }
    }
    async getRune(id) {
        return this.fetch(`/runes/${id}`);
    }
    async getRuneBalance(address, rune) {
        return this.fetch(`/address/${address}/runes/${rune}`);
    }
    async getRuneHistory(rune) {
        return this.fetch(`/runes/${rune}/history`);
    }
    async listRunes(options) {
        return this.fetch('/runes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: options ? JSON.stringify(options) : undefined,
        });
    }
    async getRuneStats(rune) {
        return this.fetch(`/runes/${rune}/stats`);
    }
    async validateRuneTransaction(txHex) {
        return this.fetch('/runes/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ txHex }),
        });
    }
    async searchRunes(options) {
        return this.fetch('/runes/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });
    }
}
exports.APIService = APIService;
