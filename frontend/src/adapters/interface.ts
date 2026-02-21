export interface WalletAdapter {
  connect(): Promise<{ address: string; balance: string; chainId: string; networkName: string }>;
  disconnect(): void;
  getBalance(address: string): Promise<string>;
  getBalanceRaw(address: string): Promise<bigint>;
  isConnected(): boolean;
  getAddress(): string | null;
  onAccountChanged(cb: (address: string | null) => void): void;
  onChainChanged(cb: (chainId: string) => void): void;
  onDisconnect(cb: () => void): void;
}

export interface TransactionAdapter {
  sendPayment(params: {
    to: string;
    amountWei: bigint;
    memo?: string;
  }): Promise<{ txHash: string; explorerUrl: string }>;
  estimateGas(params: { to: string; amountWei: bigint }): Promise<bigint>;
  getExplorerUrl(txHash: string): string;
}

export interface MandatorAdapter extends WalletAdapter, TransactionAdapter {}
