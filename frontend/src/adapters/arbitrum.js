/**
 * Arbitrum Adapter Stub
 * To be filled with ethers.js + contract calls
 */
const arbitrumAdapter = {
  connectWallet: async () => {
    throw new Error('Arbitrum adapter: connectWallet not yet implemented. Requires ethers.js + MetaMask.');
  },

  getVaultBalance: async (address) => {
    throw new Error('Arbitrum adapter: getVaultBalance not yet implemented.');
  },

  sendTransaction: async (to, amount, memo) => {
    throw new Error('Arbitrum adapter: sendTransaction not yet implemented.');
  },

  topUpVault: async (amount) => {
    throw new Error('Arbitrum adapter: topUpVault not yet implemented.');
  },
};

export default arbitrumAdapter;
