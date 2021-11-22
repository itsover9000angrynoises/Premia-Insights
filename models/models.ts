export type eventPurchase = {
  account: string,
  longTokenId: string,
  contractSize: number,
  baseCost: string,
  feeCost: string,
  newPrice64x64: string
}

export type eventExercise = {
  user: string,
  longTokenId: string,
  contractSize:number,
  exerciseValue:string,
  fee:string,
}

export type eventForTelegram = {
  size: number|string,
  pair?: string,
  type?: string,
  maturity?: string,
  strikePrice?: number,
  fees?:number|string,
  exerciseValue?:number,
}

export type eventDeposit = {
  type: string,
  amount: number,
}

export type eventWithdrawal ={
  type: string,
  amount: number,
}