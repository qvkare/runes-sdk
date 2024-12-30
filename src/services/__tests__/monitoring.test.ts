import { jest } from '@jest/globals';
import { MonitoringService } from '../monitoring';
import { BitcoinCoreService } from '../bitcoin-core.service';
import { createMockBitcoinCore, createMockLogger } from '../../utils/__tests__/test.utils';
import { Logger } from '../../utils/logger';

describe('MonitoringService', () => {
  let service: MonitoringService;
  let mockBitcoinCore: jest.Mocked<BitcoinCoreService>;
  let mockLogger: jest.Mocked<Logger>;
  let callback: jest.Mock;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockBitcoinCore = createMockBitcoinCore();
    service = new MonitoringService(mockBitcoinCore, mockLogger);
    callback = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('startMonitoring', () => {
    it('should start monitoring successfully', async () => {
      mockBitcoinCore.getBlockCount.mockResolvedValueOnce(100);
      await service.startMonitoring(callback);
      expect(callback).toHaveBeenCalledWith(100);
      expect(service.isMonitoring()).toBe(true);
    });

    it('should handle monitoring error', async () => {
      mockBitcoinCore.getBlockCount.mockRejectedValueOnce(new Error('Monitoring failed'));
      await expect(service.startMonitoring(callback)).rejects.toThrow('Failed to start monitoring');
      expect(service.isMonitoring()).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should throw error if already monitoring', async () => {
      mockBitcoinCore.getBlockCount.mockResolvedValueOnce(100);
      await service.startMonitoring(callback);
      await expect(service.startMonitoring(callback)).rejects.toThrow('Already monitoring');
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring successfully', async () => {
      mockBitcoinCore.getBlockCount.mockResolvedValueOnce(100);
      await service.startMonitoring(callback);
      service.stopMonitoring();
      expect(service.isMonitoring()).toBe(false);
    });
  });

  describe('getNetworkStatus', () => {
    it('should return network status', async () => {
      mockBitcoinCore.getBlockCount.mockResolvedValueOnce(100);
      mockBitcoinCore.getMemPoolInfo.mockResolvedValueOnce({
        size: 10,
        bytes: 1000,
      });

      const status = await service.getNetworkStatus();

      expect(status).toEqual({
        blockHeight: 100,
        memPoolInfo: {
          size: 10,
          bytes: 1000,
        },
      });
    });

    it('should handle error when getting network status', async () => {
      mockBitcoinCore.getBlockCount.mockRejectedValueOnce(new Error('Failed to get status'));
      await expect(service.getNetworkStatus()).rejects.toThrow('Failed to get network status');
    });
  });

  describe('logging', () => {
    it('should log UTXO count update', () => {
      const utxoCount = 100;
      service.logInfo(`UTXO count updated: ${utxoCount}`);
      expect(mockLogger.info).toHaveBeenCalledWith(`UTXO count updated: ${utxoCount}`, undefined);
    });

    it('should log error with details', () => {
      const error = new Error('Test error');
      service.logError('Error occurred', error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', error);
    });

    it('should log info message', () => {
      const logger = mockLogger;
      service.logInfo('Test info');
      expect(logger.info).toHaveBeenCalledWith('Test info', undefined);
    });
  });
});
