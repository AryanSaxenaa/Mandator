/**
 * Chain Adapter Interface
 * All chain adapters must implement these 4 functions.
 */
export const ChainAdapterInterface = {
  connectWallet: async () => {
    throw new Error('connectWallet() not implemented');
  },
  getVaultBalance: async (address) => {
    throw new Error('getVaultBalance() not implemented');
  },
  sendTransaction: async (to, amount, memo) => {
    throw new Error('sendTransaction() not implemented');
  },
  topUpVault: async (amount) => {
    throw new Error('topUpVault() not implemented');
  },
};
