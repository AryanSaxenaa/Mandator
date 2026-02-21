/**
 * Aya Multichain Adapter Stub
 * EVM fallback, Aya SDK ready hook
 */
const ayaMultichainAdapter = {
  connectWallet: async () => {
    throw new Error('Aya Multichain adapter: connectWallet not yet implemented. Requires Aya SDK.');
  },

  getVaultBalance: async (address) => {
    throw new Error('Aya Multichain adapter: getVaultBalance not yet implemented.');
  },

  sendTransaction: async (to, amount, memo) => {
    throw new Error('Aya Multichain adapter: sendTransaction not yet implemented.');
  },

  topUpVault: async (amount) => {
    throw new Error('Aya Multichain adapter: topUpVault not yet implemented.');
  },
};

export default ayaMultichainAdapter;
