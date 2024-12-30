import { RunesService } from '../src';

async function main() {
  // Initialize SDK
  const runesService = new RunesService({
    bitcoinRpc: {
      host: 'localhost',
      port: 8332,
      username: process.env.BTC_RPC_USER || 'user',
      password: process.env.BTC_RPC_PASS || 'pass',
    },
    network: 'testnet',
    monitoring: {
      enabled: true,
      port: 9090,
    },
  });

  try {
    // Mint new runes
    console.log('Minting new runes...');
    const mintResult = await runesService.mintRunes({
      symbol: 'TEST',
      supply: 1000000,
    });
    console.log('Mint result:', mintResult);

    // Wait for confirmation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get balance
    console.log('Getting balance...');
    const balance = await runesService.getBalance(mintResult.to, 'TEST');
    console.log('Balance:', balance);

    // Send runes
    console.log('Sending runes...');
    const sendResult = await runesService.sendRunes({
      symbol: 'TEST',
      amount: 1000,
      to: 'tb1qtest...', // Replace with actual testnet address
    });
    console.log('Send result:', sendResult);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

main();
