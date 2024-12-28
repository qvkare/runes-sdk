import { RuneSecurityService } from '../rune.security.service';
import { RuneTransfer } from '../../types/rune.types';

describe('RuneSecurityService', () => {
  let securityService: RuneSecurityService;

  beforeEach(() => {
    securityService = new RuneSecurityService({
      maxTransferAmount: 1000000,
      maxBlockUsage: 0.75,
      blacklistedAddresses: ['blacklisted1', 'blacklisted2'],
      allowedAddresses: ['allowed1', 'allowed2']
    });
  });

  describe('validateTransfer', () => {
    it('should validate a valid transfer', async () => {
      const transfer: RuneTransfer = {
        txid: 'valid_txid',
        rune: 'RUNE',
        from: 'valid_from',
        to: 'valid_to',
        amount: '500000',
        timestamp: Date.now(),
        blockHeight: 100,
        status: 'pending'
      };

      const result = await securityService.validateTransfer(transfer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject transfer with excessive amount', async () => {
      const transfer: RuneTransfer = {
        txid: 'valid_txid',
        rune: 'RUNE',
        from: 'valid_from',
        to: 'valid_to',
        amount: '2000000',
        timestamp: Date.now(),
        blockHeight: 100,
        status: 'pending'
      };

      const result = await securityService.validateTransfer(transfer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Transfer amount exceeds maximum limit of 1000000');
    });
  });

  describe('assessAddressRisk', () => {
    it('should assess high risk for new addresses', async () => {
      const result = await securityService.assessAddressRisk('new_address', 'valid_address');
      expect(result.level).toBe('high');
      expect(result.factors).toContain('New address with limited history');
      expect(result.recommendations).toContain('Wait for more transaction history');
    });

    it('should assess medium risk for moderately aged addresses', async () => {
      const result = await securityService.assessAddressRisk('medium_address', 'valid_address');
      expect(result.level).toBe('medium');
      expect(result.factors).toContain('Address has moderate history');
      expect(result.recommendations).toContain('Monitor transaction patterns');
    });

    it('should assess low risk for established addresses', async () => {
      const result = await securityService.assessAddressRisk('old_address', 'valid_address');
      expect(result.level).toBe('low');
      expect(result.factors).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });
  });
}); 