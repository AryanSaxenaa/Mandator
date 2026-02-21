import { create } from 'zustand';
import { adapter } from '../adapters';
import { WalletNotFoundError } from '../adapters/errors';

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum',
  '0xaa36a7': 'Sepolia',
  '0x66eee': 'Arbitrum Sepolia',
  '0xa4b1': 'Arbitrum One',
};

interface WalletState {
  address: string | null;
  balance: string;
  balanceRaw: bigint;
  chainId: string | null;
  networkName: string;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  darkMode: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<string | undefined>;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  address: null,
  balance: '0',
  balanceRaw: 0n,
  chainId: null,
  networkName: '',
  isConnecting: false,
  isConnected: false,
  error: null,
  darkMode: false,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const result = await adapter.connect();
      set({
        address: result.address,
        balance: result.balance,
        balanceRaw: 0n,
        chainId: result.chainId,
        networkName: result.networkName,
        isConnected: true,
        isConnecting: false,
      });

      const rawBal = await adapter.getBalanceRaw(result.address);
      set({ balanceRaw: rawBal });

      adapter.onAccountChanged(async (addr) => {
        if (!addr) {
          get().disconnect();
        } else {
          set({ address: addr });
          await get().refreshBalance();
        }
      });

      adapter.onChainChanged(async (chainId) => {
        const networkName = CHAIN_NAMES[chainId] || 'Unknown Network';
        set({ chainId, networkName });
        await get().refreshBalance();
      });

      adapter.onDisconnect(() => {
        get().disconnect();
      });
    } catch (err: unknown) {
      const message = err instanceof WalletNotFoundError
        ? 'No wallet extension detected. Please install MetaMask or another EVM wallet.'
        : (err as Error).message || 'Failed to connect wallet';
      set({ error: message, isConnecting: false });
    }
  },

  disconnect: () => {
    adapter.disconnect();
    set({
      address: null,
      balance: '0',
      balanceRaw: 0n,
      chainId: null,
      networkName: '',
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  },

  refreshBalance: async () => {
    const { address, isConnected } = get();
    if (!isConnected || !address) return undefined;
    try {
      const balance = await adapter.getBalance(address);
      const balanceRaw = await adapter.getBalanceRaw(address);
      set({ balance, balanceRaw });
      return balance;
    } catch {
      return undefined;
    }
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setDarkMode: (dark: boolean) => {
    set({ darkMode: dark });
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
