import mockAdapter from './mock';
import bitcoinMidlAdapter from './bitcoin-midl';
import arbitrumAdapter from './arbitrum';
import ayaMultichainAdapter from './aya-multichain';

const adapters = {
  mock: mockAdapter,
  'bitcoin-midl': bitcoinMidlAdapter,
  arbitrum: arbitrumAdapter,
  'aya-multichain': ayaMultichainAdapter,
};

const adapterName = import.meta.env.VITE_CHAIN_ADAPTER || 'mock';
const adapter = adapters[adapterName] || mockAdapter;

export default adapter;
