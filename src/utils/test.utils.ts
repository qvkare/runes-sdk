import { jest } from '@jest/globals';
import { RpcClient } from '../types/rpc.types';
import { Transaction } from '../types/transaction.types';
import { Logger } from '../types/logger.types';

export function createMockLogger(): jest.Mocked<Logger> {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

export function createMockRpcClient(): jest.Mocked<RpcClient> {
  return {
    url: 'http://localhost:8332',
    username: 'test',
    password: 'test',
    call: jest.fn(),
    getTransaction: jest.fn(),
    getBalance: jest.fn(),
    sendTransaction: jest.fn(),
    validateTransaction: jest.fn(),
    watchTransaction: jest.fn(),
    stopWatchingTransaction: jest.fn()
  };
}

export function createMockTransaction(): Transaction {
  return {
    id: 'test-id',
    txid: 'test-txid',
    type: 'transfer',
    blockHash: 'test-block-hash',
    blockHeight: 100,
    amount: '100',
    fee: '1000',
    confirmations: 1,
    timestamp: Date.now(),
    sender: 'test-sender',
    recipient: 'test-recipient',
    size: 100,
    time: Date.now(),
    version: 1
  };
}

export const createMockRPCClient = createMockRpcClient;
