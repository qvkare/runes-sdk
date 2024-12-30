import { BitcoinCoreService } from './bitcoin-core';
import { MonitoringService } from './monitoring';
import { RunesConfig, RunesTransaction, RunesBalance, RunesError } from '../types/runes';
import { encodeRuneData, decodeRuneData } from '../utils/runes-encoding';

export class RunesService {
  private bitcoinCore: BitcoinCoreService;
  private monitoring: MonitoringService;
  private network: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(config: RunesConfig) {
    this.bitcoinCore = new BitcoinCoreService(config.bitcoinRpc);
    this.monitoring = new MonitoringService(config.monitoringPort);
    this.network = config.network;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Mint new runes with specified parameters
   * @param params Minting parameters
   * @returns Transaction details
   */
  async mintRunes(params: {
    symbol: string;
    supply: number;
    limit?: number;
  }): Promise<RunesTransaction> {
    const startTime = Date.now();
    try {
      this.monitoring.logInfo('Starting rune mint', params);

      // Validate minting parameters
      this.validateMintParams(params);

      // Get funding UTXOs
      const utxos = await this.bitcoinCore.listUnspent();
      if (!utxos.length) {
        throw new RunesError('No unspent outputs available', 'INSUFFICIENT_FUNDS');
      }

      // Create rune mint data
      const runeData = encodeRuneData({
        type: 'mint',
        symbol: params.symbol,
        supply: params.supply,
        limit: params.limit,
      });

      // Create and sign transaction
      const tx = await this.createRuneTransaction(utxos[0], runeData);

      // Broadcast transaction
      const txid = await this.bitcoinCore.sendRawTransaction(tx.hex);

      const result = {
        txid,
        symbol: params.symbol,
        type: 'mint' as const,
        amount: params.supply,
        to: utxos[0].address,
        confirmations: 0,
        timestamp: Date.now(),
        status: 'pending' as const,
      };

      // Track metrics
      this.monitoring.trackTransaction('mint', params.symbol, 'success');
      this.monitoring.trackTransactionDuration('mint', Date.now() - startTime);
      this.monitoring.logInfo('Rune mint completed', result);

      return result;
    } catch (error) {
      this.monitoring.trackTransaction('mint', params.symbol, 'failed');
      this.monitoring.trackError('mint', error.code || 'UNKNOWN');
      this.monitoring.logError('Rune mint failed', error, params);

      throw new RunesError(`Failed to mint runes: ${error.message}`, 'MINT_RUNES_FAILED', error);
    }
  }

  /**
   * Send runes to another address
   * @param params Transfer parameters
   * @returns Transaction details
   */
  async sendRunes(params: {
    symbol: string;
    amount: number;
    to: string;
  }): Promise<RunesTransaction> {
    const startTime = Date.now();
    try {
      this.monitoring.logInfo('Starting rune transfer', params);

      // Validate transfer parameters
      await this.validateTransferParams(params);

      // Get rune UTXOs
      const runeUtxos = await this.getRuneUtxos(params.symbol);
      const selectedUtxo = this.selectRuneUtxo(runeUtxos, params.amount);

      // Update UTXO metrics
      this.monitoring.updateUtxoCount(params.symbol, runeUtxos.length);

      // Create rune transfer data
      const runeData = encodeRuneData({
        type: 'transfer',
        symbol: params.symbol,
        amount: params.amount,
      });

      // Create and sign transaction
      const tx = await this.createRuneTransaction(selectedUtxo, runeData, params.to);

      // Broadcast transaction
      const txid = await this.bitcoinCore.sendRawTransaction(tx.hex);

      const result = {
        txid,
        symbol: params.symbol,
        type: 'transfer' as const,
        amount: params.amount,
        from: selectedUtxo.address,
        to: params.to,
        confirmations: 0,
        timestamp: Date.now(),
        status: 'pending' as const,
      };

      // Track metrics
      this.monitoring.trackTransaction('transfer', params.symbol, 'success');
      this.monitoring.trackTransactionDuration('transfer', Date.now() - startTime);
      this.monitoring.logInfo('Rune transfer completed', result);

      return result;
    } catch (error) {
      this.monitoring.trackTransaction('transfer', params.symbol, 'failed');
      this.monitoring.trackError('transfer', error.code || 'UNKNOWN');
      this.monitoring.logError('Rune transfer failed', error, params);

      throw new RunesError(`Failed to send runes: ${error.message}`, 'SEND_RUNES_FAILED', error);
    }
  }

  /**
   * Get runes balance for an address
   * @param address Bitcoin address
   * @param symbol Rune symbol
   * @returns Balance information
   */
  async getBalance(address: string, symbol: string): Promise<RunesBalance> {
    try {
      this.monitoring.logInfo('Getting rune balance', { address, symbol });

      // Validate address
      const validationResult = await this.bitcoinCore.validateAddress(address);
      if (!validationResult.isvalid) {
        throw new Error('Invalid address');
      }

      // Get all UTXOs for address
      const utxos = await this.bitcoinCore.listUnspent(1, 9999999, [address]);

      // Calculate total balance
      let balance = 0;
      for (const utxo of utxos) {
        const tx = await this.bitcoinCore.getRawTransaction(utxo.txid);
        const runeData = this.extractRuneData(tx);
        if (runeData && runeData.symbol === symbol) {
          balance += runeData.amount;
        }
      }

      const result = {
        symbol,
        amount: balance,
        address,
        lastUpdated: Date.now(),
      };

      // Update balance metrics
      this.monitoring.updateBalance(symbol, address, balance);
      this.monitoring.logInfo('Got rune balance', result);

      return result;
    } catch (error) {
      this.monitoring.trackError('get_balance', error.code || 'UNKNOWN');
      this.monitoring.logError('Failed to get rune balance', error, { address, symbol });

      throw new RunesError(`Failed to get balance: ${error.message}`, 'GET_BALANCE_FAILED', error);
    }
  }

  /**
   * Validate a runes transaction
   * @param txHex Raw transaction hex
   * @returns Validation result
   */
  async validateTransaction(txHex: string): Promise<boolean> {
    try {
      const tx = await this.decodeRunesTransaction(txHex);
      return this.validateRuneData(tx);
    } catch (error) {
      throw new RunesError(
        `Failed to validate transaction: ${error.message}`,
        'VALIDATION_FAILED',
        error
      );
    }
  }

  private validateMintParams(params: { symbol: string; supply: number; limit?: number }) {
    if (!params.symbol || params.symbol.length < 1 || params.symbol.length > 4) {
      throw new Error('Invalid symbol length (must be 1-4 characters)');
    }
    if (params.supply <= 0) {
      throw new Error('Supply must be greater than 0');
    }
    if (params.limit && params.limit < params.supply) {
      throw new Error('Limit cannot be less than supply');
    }
  }

  private async validateTransferParams(params: { symbol: string; amount: number; to: string }) {
    const validationResult = await this.bitcoinCore.validateAddress(params.to);
    if (!validationResult.isvalid) {
      throw new Error('Invalid recipient address');
    }
    if (params.amount <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }
  }

  private async createRuneTransaction(
    utxo: RuneUtxo,
    runeData: string,
    recipientAddress?: string
  ): Promise<{ hex: string; complete: boolean }> {
    try {
      // Calculate fees and amounts
      const feeRate = 10; // sat/vB
      const estimatedSize = 250; // bytes
      const fee = feeRate * estimatedSize;

      // Prepare inputs
      const inputs = [
        {
          txid: utxo.txid,
          vout: utxo.vout,
        },
      ];

      // Prepare outputs
      const outputs: Record<string, number> = {};

      if (recipientAddress) {
        // Transfer transaction
        outputs[recipientAddress] = utxo.amount - fee;

        // Add change address if needed
        if (utxo.amount - fee > 0) {
          const changeAddress = await this.bitcoinCore.getNewAddress();
          outputs[changeAddress] = utxo.amount - fee - outputs[recipientAddress];
        }
      } else {
        // Mint transaction
        const mintAddress = await this.bitcoinCore.getNewAddress();
        outputs[mintAddress] = utxo.amount - fee;
      }

      // Create raw transaction
      const rawTx = await this.bitcoinCore.createRawTransaction(inputs, outputs);

      // Add OP_RETURN output with rune data
      const txWithRuneData = this.addRuneDataToTransaction(rawTx, runeData);

      // Sign transaction
      const signedTx = await this.bitcoinCore.signRawTransactionWithWallet(txWithRuneData);

      if (!signedTx.complete) {
        throw new Error('Failed to sign transaction');
      }

      return signedTx;
    } catch (error) {
      throw new Error(`Failed to create rune transaction: ${error.message}`);
    }
  }

  private addRuneDataToTransaction(rawTx: string, runeData: string): string {
    // Convert hex to Buffer
    const txBuffer = Buffer.from(rawTx, 'hex');

    // Add OP_RETURN output
    const opReturn = Buffer.concat([
      Buffer.from('6a', 'hex'), // OP_RETURN
      Buffer.from(runeData, 'hex'),
    ]);

    // Insert OP_RETURN output before the last output
    const position = txBuffer.length - 4; // Before locktime
    const newTx = Buffer.concat([txBuffer.slice(0, position), opReturn, txBuffer.slice(position)]);

    return newTx.toString('hex');
  }

  private async getRuneUtxos(symbol: string): Promise<RuneUtxo[]> {
    try {
      // Get all unspent outputs
      const allUtxos = await this.bitcoinCore.listUnspent();
      const runeUtxos: RuneUtxo[] = [];

      // Filter UTXOs for specific rune symbol
      for (const utxo of allUtxos) {
        const tx = await this.bitcoinCore.getRawTransaction(utxo.txid);
        const runeData = this.extractRuneData(tx);

        if (runeData && runeData.symbol === symbol) {
          runeUtxos.push({
            txid: utxo.txid,
            vout: utxo.vout,
            address: utxo.address,
            amount: runeData.amount,
            symbol: runeData.symbol,
            scriptPubKey: utxo.scriptPubKey,
            confirmations: utxo.confirmations,
          });
        }
      }

      // Sort by confirmations (most confirmed first) and amount (largest first)
      return runeUtxos.sort((a, b) => {
        if (a.confirmations === b.confirmations) {
          return b.amount - a.amount;
        }
        return b.confirmations - a.confirmations;
      });
    } catch (error) {
      throw new Error(`Failed to get rune UTXOs: ${error.message}`);
    }
  }

  private selectRuneUtxo(utxos: RuneUtxo[], amount: number): RuneUtxo {
    // Validate input
    if (!utxos.length) {
      throw new Error('No UTXOs available');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }

    // First try: find exact match
    const exactMatch = utxos.find((utxo) => utxo.amount === amount);
    if (exactMatch) {
      return exactMatch;
    }

    // Second try: find closest larger amount
    const largerUtxos = utxos.filter((utxo) => utxo.amount > amount);
    if (largerUtxos.length > 0) {
      // Sort by amount ascending to get the smallest one that's still larger than amount
      return largerUtxos.sort((a, b) => a.amount - b.amount)[0];
    }

    // Third try: combine multiple UTXOs
    let totalAmount = 0;
    const selectedUtxos = utxos.filter((utxo) => {
      if (totalAmount < amount) {
        totalAmount += utxo.amount;
        return true;
      }
      return false;
    });

    if (totalAmount >= amount) {
      // Return the largest UTXO from the selected ones
      return selectedUtxos.sort((a, b) => b.amount - a.amount)[0];
    }

    throw new Error(`No suitable UTXO found for amount: ${amount}`);
  }

  private extractRuneData(
    tx: RuneTransactionData
  ): { symbol: string; amount: number; type: 'mint' | 'transfer' } | null {
    try {
      // Find OP_RETURN output containing rune data
      const runeOutput = tx.outputs.find((output) => {
        // Check if output is OP_RETURN and starts with RUNE prefix
        return (
          output.scriptPubKey.startsWith('6a') && // OP_RETURN
          output.scriptPubKey.includes('52554E45')
        ); // "RUNE" in hex
      });

      if (!runeOutput || !runeOutput.runeData) {
        return null;
      }

      return {
        symbol: runeOutput.runeData.symbol,
        amount: runeOutput.runeData.amount,
        type: runeOutput.runeData.type,
      };
    } catch (error) {
      return null;
    }
  }

  private async decodeRunesTransaction(txHex: string): Promise<RuneTransactionData> {
    try {
      // Get raw transaction data
      const tx = await this.bitcoinCore.getRawTransaction(txHex);

      // Extract basic transaction data
      const decodedTx: RuneTransactionData = {
        version: tx.version,
        inputs: tx.vin.map((input) => ({
          txid: input.txid,
          vout: input.vout,
          scriptSig: input.scriptSig.hex,
          sequence: input.sequence,
        })),
        outputs: await Promise.all(
          tx.vout.map(async (output) => {
            const baseOutput = {
              value: output.value,
              scriptPubKey: output.scriptPubKey.hex,
            };

            // Check if this output contains rune data
            if (output.scriptPubKey.hex.startsWith('6a')) {
              // OP_RETURN
              const runeDataHex = output.scriptPubKey.hex.slice(2); // Remove OP_RETURN
              try {
                const decoded = decodeRuneData(runeDataHex);
                return {
                  ...baseOutput,
                  runeData: {
                    symbol: decoded.symbol,
                    amount: decoded.type === 'mint' ? decoded.supply! : decoded.amount!,
                    type: decoded.type,
                  },
                };
              } catch {
                return baseOutput;
              }
            }

            return baseOutput;
          })
        ),
        locktime: tx.locktime,
      };

      return decodedTx;
    } catch (error) {
      throw new Error(`Failed to decode runes transaction: ${error.message}`);
    }
  }

  private validateRuneData(tx: RuneTransactionData): RuneValidationResult {
    const result: RuneValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      // Find rune data in outputs
      const runeOutput = tx.outputs.find((output) => output.runeData);

      if (!runeOutput || !runeOutput.runeData) {
        result.isValid = false;
        result.errors!.push('No rune data found in transaction');
        return result;
      }

      const { symbol, amount, type } = runeOutput.runeData;
      result.details = { symbol, amount, type };

      // Basic validations
      if (!symbol || symbol.length < 1 || symbol.length > 4) {
        result.isValid = false;
        result.errors!.push('Invalid rune symbol length');
      }

      if (amount <= 0) {
        result.isValid = false;
        result.errors!.push('Invalid rune amount');
      }

      // Type-specific validations
      if (type === 'mint') {
        // Check if this is the first mint for this symbol
        // TODO: Implement mint history check
      } else if (type === 'transfer') {
        // Calculate input and output totals
        let inputTotal = 0;
        let outputTotal = 0;

        // Sum up input amounts
        for (const input of tx.inputs) {
          const inputTx = await this.bitcoinCore.getRawTransaction(input.txid);
          const runeData = this.extractRuneData(inputTx);
          if (runeData && runeData.symbol === symbol) {
            inputTotal += runeData.amount;
          }
        }

        // Sum up output amounts
        for (const output of tx.outputs) {
          if (output.runeData && output.runeData.symbol === symbol) {
            outputTotal += output.runeData.amount;
          }
        }

        result.details.inputTotal = inputTotal;
        result.details.outputTotal = outputTotal;

        // Validate conservation of runes
        if (inputTotal !== outputTotal) {
          result.isValid = false;
          result.errors!.push('Rune input and output amounts do not match');
        }
      } else {
        result.isValid = false;
        result.errors!.push('Invalid rune operation type');
      }

      // Add warnings for low confirmations
      const minConfirmations = 6;
      for (const input of tx.inputs) {
        const inputTx = await this.bitcoinCore.getRawTransaction(input.txid);
        if (inputTx.confirmations < minConfirmations) {
          result.warnings!.push(
            `Input transaction ${input.txid} has less than ${minConfirmations} confirmations`
          );
        }
      }

      return result;
    } catch (error) {
      result.isValid = false;
      result.errors!.push(`Validation error: ${error.message}`);
      return result;
    }
  }
}
