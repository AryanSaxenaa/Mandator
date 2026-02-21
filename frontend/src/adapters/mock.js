let connected = false;
let balance = 12.4;

const mockAdapter = {
  connectWallet: async () => {
    connected = true;
    return {
      address: '0xMOCK_1a2b3c4d5e6f7890abcdef',
      chain: 'mock-testnet',
    };
  },

  getVaultBalance: async (address) => {
    const fluctuation = (Math.random() - 0.5) * 0.2;
    balance = Math.max(0, balance + fluctuation);
    return {
      balance: parseFloat(balance.toFixed(4)),
      currency: 'ETH',
      usdValue: parseFloat((balance * 3200).toFixed(2)),
    };
  },

  sendTransaction: async (to, amount, memo) => {
    balance -= amount;
    return {
      txid: `mock_tx_${Date.now().toString(36)}`,
      status: 'confirmed',
      amount,
      to,
      memo,
      timestamp: new Date().toISOString(),
    };
  },

  topUpVault: async (amount) => {
    balance += amount;
    return {
      txid: `mock_topup_${Date.now().toString(36)}`,
      newBalance: parseFloat(balance.toFixed(4)),
    };
  },
};

export default mockAdapter;
