export type eventPurchase = {
  account: string,
  longTokenId: string,
  contractSize: number,
  baseCost: string,
  feeCost: string,
  newPrice64x64: string
}

export type eventForTelegram = {
  size: number,
  pair?: string,
  type?: string,
  maturity?: string,
  strikePrice?: number
}

export type eventDeposit = {
  type: string,
  amount: number,
}

export type eventWithdrawal ={
  type: string,
  amount: number,
}