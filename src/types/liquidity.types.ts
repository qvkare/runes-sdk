export interface LiquidityProvider {
  address: string;
  amount: bigint;
}

export interface LiquidityPool {
  id: string;
  rune: string;
  totalLiquidity: bigint;
  providers: LiquidityProvider[];
  createdAt: Date;
  updatedAt: Date;
} 