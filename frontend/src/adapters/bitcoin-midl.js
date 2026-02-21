/**
 * Bitcoin (Midl) Adapter Stub
 * To be filled with Midl RPC + Xverse SDK integration
 */
const bitcoinMidlAdapter = {
  connectWallet: async () => {
    throw new Error('Bitcoin Midl adapter: connectWallet not yet implemented. Requires Xverse SDK.');
  },

  getVaultBalance: async (address) => {
    throw new Error('Bitcoin Midl adapter: getVaultBalance not yet implemented. Requires Midl RPC.');
  },

  sendTransaction: async (to, amount, memo) => {
    throw new Error('Bitcoin Midl adapter: sendTransaction not yet implemented.');
  },

  topUpVault: async (amount) => {
    throw new Error('Bitcoin Midl adapter: topUpVault not yet implemented.');
  },
};

export default bitcoinMidlAdapter;
