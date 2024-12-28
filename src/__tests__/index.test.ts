import { RunesSDK } from '../index';
import { APIService } from '../services';
import { SDKConfig } from '../types';

jest.mock('../services/api');

describe('RunesSDK', () => {
  let sdk: RunesSDK;
  const mockConfig: SDKConfig = {
    ordServer: 'https://api.example.com',
    network: 'testnet'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new RunesSDK(mockConfig);
  });

  describe('getRune', () => {
    it('should call api.getRune with correct parameters', async () => {
      const mockRune = {
        id: 'TEST',
        symbol: 'TST',
        supply: '1000',
        timestamp: Date.now(),
        mintable: true
      };

      (APIService.prototype.getRune as jest.Mock).mockResolvedValueOnce(mockRune);

      const result = await sdk.getRune('TEST');

      expect(APIService.prototype.getRune).toHaveBeenCalledWith('TEST');
      expect(result).toEqual(mockRune);
    });
  });

  describe('getRuneBalance', () => {
    it('should call api.getRuneBalance with correct parameters', async () => {
      const mockBalance = {
        rune: 'TEST',
        amount: '100',
        address: 'bc1qxxx',
        lastUpdated: Date.now()
      };

      (APIService.prototype.getRuneBalance as jest.Mock).mockResolvedValueOnce(mockBalance);

      const result = await sdk.getRuneBalance('bc1qxxx', 'TEST');

      expect(APIService.prototype.getRuneBalance).toHaveBeenCalledWith('bc1qxxx', 'TEST');
      expect(result).toEqual(mockBalance);
    });
  });

  describe('getRuneHistory', () => {
    it('should call api.getRuneHistory with correct parameters', async () => {
      const mockHistory = [{
        txid: 'tx1',
        timestamp: Date.now(),
        transfers: [],
        blockHeight: 100
      }];

      (APIService.prototype.getRuneHistory as jest.Mock).mockResolvedValueOnce(mockHistory);

      const result = await sdk.getRuneHistory('TEST');

      expect(APIService.prototype.getRuneHistory).toHaveBeenCalledWith('TEST');
      expect(result).toEqual(mockHistory);
    });
  });

  describe('listRunes', () => {
    it('should call api.listRunes with correct parameters', async () => {
      const mockResponse = {
        items: [{
          id: 'TEST',
          symbol: 'TST',
          supply: '1000',
          timestamp: Date.now(),
          mintable: true
        }],
        total: 1,
        offset: 0,
        limit: 10
      };

      (APIService.prototype.listRunes as jest.Mock).mockResolvedValueOnce(mockResponse);

      const options = { limit: 10, offset: 0 };
      const result = await sdk.listRunes(options);

      expect(APIService.prototype.listRunes).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResponse);
    });

    it('should call api.listRunes without parameters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        offset: 0,
        limit: 10
      };

      (APIService.prototype.listRunes as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await sdk.listRunes();

      expect(APIService.prototype.listRunes).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRuneStats', () => {
    it('should call api.getRuneStats with correct parameters', async () => {
      const mockStats = {
        totalSupply: '1000',
        holders: 10,
        transfers: 5,
        lastActivity: Date.now()
      };

      (APIService.prototype.getRuneStats as jest.Mock).mockResolvedValueOnce(mockStats);

      const result = await sdk.getRuneStats('TEST');

      expect(APIService.prototype.getRuneStats).toHaveBeenCalledWith('TEST');
      expect(result).toEqual(mockStats);
    });
  });

  describe('validateRuneTransaction', () => {
    it('should call api.validateRuneTransaction with correct parameters', async () => {
      const mockValidation = {
        valid: true,
        transfers: []
      };

      (APIService.prototype.validateRuneTransaction as jest.Mock).mockResolvedValueOnce(mockValidation);

      const result = await sdk.validateRuneTransaction('txHex');

      expect(APIService.prototype.validateRuneTransaction).toHaveBeenCalledWith('txHex');
      expect(result).toEqual(mockValidation);
    });
  });

  describe('searchRunes', () => {
    it('should call api.searchRunes with correct parameters', async () => {
      const mockResponse = { data: [], total: 0 };
      (APIService.prototype.searchRunes as jest.Mock).mockResolvedValue(mockResponse);

      const options = { query: 'test' };
      const result = await sdk.searchRunes(options);

      expect(APIService.prototype.searchRunes).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResponse);
    });
  });
}); 