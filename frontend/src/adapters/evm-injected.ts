import type { MandatorAdapter } from './interface';
import { WalletNotFoundError, WalletNotConnectedError } from './errors';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum',
  '0xaa36a7': 'Sepolia',
  '0x66eee': 'Arbitrum Sepolia',
  '0xa4b1': 'Arbitrum One',
};

const EXPLORER_BASES: Record<string, string> = {
  '0x1': 'https://etherscan.io',
  '0xaa36a7': 'https://sepolia.etherscan.io',
  '0x66eee': 'https://sepolia.arbiscan.io',
  '0xa4b1': 'https://arbiscan.io',
};

function formatEther(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = wei % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, '0').slice(0, 4);
  return `${whole}.${fracStr}`;
}

function getSymbol(chainId: string | null): string {
  if (chainId === '0xa4b1' || chainId === '0x66eee') return 'ETH';
  return 'ETH';
}

class EVMInjectedAdapter implements MandatorAdapter {
  private _address: string | null = null;
  private _chainId: string | null = null;

  private getProvider() {
    if (!window.ethereum) throw new WalletNotFoundError();
    return window.ethereum;
  }

  async connect(): Promise<{ address: string; balance: string; chainId: string; networkName: string }> {
    const provider = this.getProvider();
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    const address = accounts[0];
    const chainId = (await provider.request({ method: 'eth_chainId' })) as string;
    const balanceHex = (await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] })) as string;

    this._address = address;
    this._chainId = chainId;

    const balanceWei = BigInt(balanceHex);
    const networkName = CHAIN_NAMES[chainId] || 'Unknown Network';
    const balance = `${formatEther(balanceWei)} ${getSymbol(chainId)}`;

    return { address, balance, chainId, networkName };
  }

  disconnect(): void {
    this._address = null;
    this._chainId = null;
  }

  async getBalance(address: string): Promise<string> {
    const provider = this.getProvider();
    const hex = (await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] })) as string;
    const wei = BigInt(hex);
    return `${formatEther(wei)} ${getSymbol(this._chainId)}`;
  }

  async getBalanceRaw(address: string): Promise<bigint> {
    const provider = this.getProvider();
    const hex = (await provider.request({ method: 'eth_getBalance', params: [address, 'latest'] })) as string;
    return BigInt(hex);
  }

  isConnected(): boolean {
    return this._address !== null;
  }

  getAddress(): string | null {
    return this._address;
  }

  onAccountChanged(cb: (address: string | null) => void): void {
    this.getProvider().on('accountsChanged', (accounts: unknown) => {
      const accs = accounts as string[];
      const addr = accs[0] || null;
      this._address = addr;
      cb(addr);
    });
  }

  onChainChanged(cb: (chainId: string) => void): void {
    this.getProvider().on('chainChanged', (chainId: unknown) => {
      const id = chainId as string;
      this._chainId = id;
      cb(id);
    });
  }

  onDisconnect(cb: () => void): void {
    this.getProvider().on('disconnect', () => {
      this._address = null;
      this._chainId = null;
      cb();
    });
  }

  async sendPayment(params: { to: string; amountWei: bigint; memo?: string }): Promise<{ txHash: string; explorerUrl: string }> {
    if (!this._address) throw new WalletNotConnectedError();
    const { to, amountWei, memo } = params;

    if (!/^0x[0-9a-fA-F]{40}$/.test(to)) throw new Error('Invalid recipient address');
    if (amountWei <= 0n) throw new Error('Amount must be greater than 0');

    const tx: Record<string, string> = {
      from: this._address,
      to,
      value: '0x' + amountWei.toString(16),
    };

    if (memo) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(memo);
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      tx.data = '0x' + hex;
    }

    const provider = this.getProvider();
    const txHash = (await provider.request({ method: 'eth_sendTransaction', params: [tx] })) as string;
    const explorerUrl = this.getExplorerUrl(txHash);

    return { txHash, explorerUrl };
  }

  async estimateGas(params: { to: string; amountWei: bigint }): Promise<bigint> {
    if (!this._address) throw new WalletNotConnectedError();
    const provider = this.getProvider();
    const hex = (await provider.request({
      method: 'eth_estimateGas',
      params: [{ from: this._address, to: params.to, value: '0x' + params.amountWei.toString(16) }],
    })) as string;
    return BigInt(hex);
  }

  getExplorerUrl(txHash: string): string {
    const base = EXPLORER_BASES[this._chainId || '0x1'] || 'https://etherscan.io';
    return `${base}/tx/${txHash}`;
  }
}

export const adapter = new EVMInjectedAdapter();
export function getAdapter(): MandatorAdapter {
  return adapter;
}
