import { RunesSDK } from '../../src/typescript/sdk';
import { WebSocketClientService } from '../../src/services/websocket/websocket.client.service';

// Initialize SDK for CEX usage
class CexIntegrationExample {
  private sdk: RunesSDK;
  private depositAddresses: Map<string, string> = new Map();

  constructor() {
    this.sdk = new RunesSDK({
      rpcUrl: 'https://mempool.space/api',
      wsUrl: 'wss://mempool.space/api/ws'
    });
  }

  // Example 1: Track Rune token deposits
  async trackDeposits(tokenName: string, depositAddress: string) {
    this.depositAddresses.set(depositAddress, tokenName);
    
    // Connect to WebSocket
    await this.sdk.connect();
    
    // Listen for transactions
    this.sdk.on('transaction', async (tx) => {
      const token = this.depositAddresses.get(tx.to);
      if (token === tokenName) {
        // Check confirmations
        const confirmations = await this.sdk.getConfirmations(tx.id);
        
        // Process deposit after 3 confirmations
        if (confirmations >= 3) {
          console.log('Deposit confirmed:', {
            token: tokenName,
            amount: tx.amount,
            txId: tx.id,
            from: tx.from,
            to: tx.to
          });
          
          // Here you would typically:
          // 1. Update user balance in your database
          // 2. Notify user about successful deposit
          // 3. Move funds to cold storage if needed
        }
      }
    });
  }

  // Example 2: Monitor multiple addresses
  async monitorBalances(addresses: string[]) {
    try {
      const balances = await Promise.all(
        addresses.map(async (addr) => {
          const balance = await this.sdk.getRuneBalance(addr);
          return {
            address: addr,
            balance: balance,
            timestamp: new Date().toISOString()
          };
        })
      );
      
      return balances;
    } catch (error) {
      console.error('Error monitoring balances:', error);
      throw error;
    }
  }

  // Example 3: Handle withdrawals
  async processWithdrawal(
    tokenName: string,
    fromAddress: string,
    toAddress: string,
    amount: number
  ) {
    try {
      // 1. Verify balance before withdrawal
      const balance = await this.sdk.getRuneBalance(fromAddress);
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // 2. Process withdrawal
      const tx = await this.sdk.sendRunes(tokenName, toAddress, amount);
      
      // 3. Monitor transaction confirmations
      let confirmations = 0;
      while (confirmations < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        confirmations = await this.sdk.getConfirmations(tx.id);
      }
      
      return {
        success: true,
        txId: tx.id,
        confirmations: confirmations
      };
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  }

  // Example 4: Error handling and reconnection
  private setupErrorHandling() {
    this.sdk.on('error', async (error) => {
      console.error('WebSocket error:', error);
      
      // Attempt to reconnect
      try {
        await this.sdk.connect();
      } catch (reconnectError) {
        console.error('Reconnection failed:', reconnectError);
      }
    });
  }

  // Example 5: Batch balance updates
  async batchUpdateBalances(userBalances: Map<string, number>) {
    const updates: Promise<void>[] = [];
    
    for (const [address, expectedBalance] of userBalances.entries()) {
      updates.push(
        (async () => {
          const actualBalance = await this.sdk.getRuneBalance(address);
          if (actualBalance !== expectedBalance) {
            console.log('Balance mismatch:', {
              address,
              expected: expectedBalance,
              actual: actualBalance
            });
            // Update your database with actual balance
          }
        })()
      );
    }
    
    await Promise.all(updates);
  }
}

// Usage example
async function main() {
  const cex = new CexIntegrationExample();
  
  // Start tracking deposits
  await cex.trackDeposits('DOG', 'deposit-address-1');
  
  // Monitor balances every minute
  setInterval(async () => {
    const balances = await cex.monitorBalances(['address-1', 'address-2']);
    console.log('Current balances:', balances);
  }, 60000);
}

main().catch(console.error); 