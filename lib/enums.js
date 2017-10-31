export const TX_STATES = {
  NONE: 0,
  PENDING: 1,
  DONE: 2,
  FAIL: 3
}

export const MINT_STATES = {
  NONE: 0,
  MINTING: 1,
  DONE: 2,
  FAIL: -1,
  SENT: 3
}

export const ERRORS = {
  TransactionSendFailed: 'transaction-send-failed'
}