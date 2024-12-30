import { Buffer } from 'buffer';

export interface RuneData {
  type: 'mint' | 'transfer';
  symbol: string;
  amount: number;
  limit?: number;
}

export function encodeRuneData(data: RuneData): string {
  // RUNE prefix (52554E45)
  let encoded = '52554E45';

  // Version (01)
  encoded += '01';

  // Type (01 for mint, 02 for transfer)
  encoded += data.type === 'mint' ? '01' : '02';

  // Symbol (4 bytes, padded with zeros)
  const symbolBytes = Buffer.from(data.symbol.padEnd(4, '\0')).toString('hex');
  encoded += symbolBytes;

  // Amount (8 bytes)
  const amountBuffer = Buffer.alloc(8);
  amountBuffer.writeBigUInt64BE(BigInt(data.amount));
  encoded += amountBuffer.toString('hex');

  // Limit (8 bytes, only for mint)
  if (data.type === 'mint' && data.limit !== undefined) {
    const limitBuffer = Buffer.alloc(8);
    limitBuffer.writeBigUInt64BE(BigInt(data.limit));
    encoded += limitBuffer.toString('hex');
  }

  return encoded;
}

export function decodeRuneData(hex: string): RuneData {
  // RUNE prefix kontrolü
  const prefix = hex.slice(0, 8);
  if (prefix.toUpperCase() !== '52554E45') {
    throw new Error('Invalid rune data prefix');
  }

  // Version kontrolü
  const version = hex.slice(8, 10);
  if (version !== '01') {
    throw new Error('Unsupported rune version');
  }

  // Type kontrolü
  const type = hex.slice(10, 12);
  const isMint = type === '01';

  // Symbol okuma
  const symbolHex = hex.slice(12, 20);
  const symbol = Buffer.from(symbolHex, 'hex').toString().replace(/\0/g, '');

  // Amount okuma
  const amountHex = hex.slice(20, 36);
  const amount = Number(BigInt('0x' + amountHex));

  // Mint için limit okuma
  let limit: number | undefined;
  if (isMint && hex.length >= 52) {
    const limitHex = hex.slice(36, 52);
    limit = Number(BigInt('0x' + limitHex));
  }

  return {
    type: isMint ? 'mint' : 'transfer',
    symbol,
    amount,
    ...(limit !== undefined && { limit }),
  };
}

export function validateRuneSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }

  // Sembol kuralları:
  // - Sadece büyük harfler ve rakamlar
  // - 3-10 karakter arası
  return /^[A-Z0-9]{3,10}$/.test(symbol);
}

export function calculateRuneDataSize(
  type: 'mint' | 'transfer',
  hasLimit: boolean = false
): number {
  // Base size: prefix(4) + version(1) + type(1) + symbol(10) + amount(8) = 24 bytes
  let size = 24;

  // Mint işlemi ve limit varsa ekstra 8 byte
  if (type === 'mint' && hasLimit) {
    size += 8;
  }

  return size;
}
