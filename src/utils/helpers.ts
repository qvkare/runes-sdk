/**
 * Sleep function for delay operations
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validates Bitcoin address format
 * @param address - Bitcoin address to validate
 * @returns boolean indicating if address is valid
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Legacy address format (P2PKH)
  const p2pkhRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

  // Segwit address format (P2SH)
  const p2shRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;

  // Native Segwit address format (Bech32)
  const bech32Regex = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;

  return p2pkhRegex.test(address) || p2shRegex.test(address) || bech32Regex.test(address);
}

/**
 * Converts satoshis to BTC
 * @param satoshis - Amount in satoshis
 * @returns Amount in BTC
 */
export const satoshisToBTC = (satoshis: number): number => {
  return satoshis / 100000000;
};

/**
 * Converts BTC to satoshis
 * @param btc - Amount in BTC
 * @returns Amount in satoshis
 */
export const BTCToSatoshis = (btc: number): number => {
  // Handle floating point precision
  const satoshis = Math.round(btc * 100000000);
  return satoshis;
};

/**
 * Formats timestamp to ISO string
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};
