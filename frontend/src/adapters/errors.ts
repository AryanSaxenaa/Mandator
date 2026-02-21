export class WalletNotFoundError extends Error {
  constructor() {
    super('No wallet extension detected. Please install MetaMask or another EVM wallet.');
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super('Transaction rejected by user.');
  }
}

export class InsufficientFundsError extends Error {
  constructor() {
    super('Insufficient funds for this transaction.');
  }
}

export class WalletNotConnectedError extends Error {
  constructor() {
    super('Wallet not connected.');
  }
}
