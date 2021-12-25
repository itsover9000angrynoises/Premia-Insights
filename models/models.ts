export type eventPurchase = {
  account: string,
  longTokenId: string,
  contractSize: number,
  baseCost: string,
  feeCost: string,
  newPrice64x64: string,
  txHash: string,
}

export type eventExercise = {
  user: string,
  longTokenId: string,
  contractSize:number,
  exerciseValue:string,
  fee:string,
  txHash: string,
}

export type eventForTelegram = {
  size: number|string,
  pair?: string,
  type?: string,
  maturity?: string,
  strikePrice?: number,
  fees?:number|string,
  exerciseValue?:number,
  baseCost?: string|number,
}

export type eventDeposit = {
  type: string,
  amount: number,
  txHash: string,
}

export type eventWithdrawal ={
  type: string,
  amount: number,
  txHash: string,
}


export type ethContractInstance = {
  wethDai:any,
  wbtcDai:any,
  linkDai:any,
}

export type arbiContractInstance = {
  wethDai:any,
  wbtcDai:any,
  linkDai:any,
}