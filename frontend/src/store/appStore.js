import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  darkMode: false,
  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  wallet: null,
  setWallet: (wallet) => set({ wallet }),

  vaultBalance: null,
  setVaultBalance: (vaultBalance) => set({ vaultBalance }),

  selectedNode: null,
  setSelectedNode: (selectedNode) => set({ selectedNode }),

  executingNodes: new Set(),
  addExecutingNode: (id) => set((s) => {
    const next = new Set(s.executingNodes);
    next.add(id);
    return { executingNodes: next };
  }),
  removeExecutingNode: (id) => set((s) => {
    const next = new Set(s.executingNodes);
    next.delete(id);
    return { executingNodes: next };
  }),
  clearExecutingNodes: () => set({ executingNodes: new Set() }),
}));
