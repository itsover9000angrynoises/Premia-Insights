export type event = {
  account?: string,
  baseCost?: number | string,
  feeCost?: string | number,
  newPrice64x64?: string,
  user?: string,
  longTokenId?: string,
  contractSize?: number,
  exerciseValue?: string | number,
  fee?: number | string,
  type?: string,
  amount?: number,
  txHash: string,
  maturity?: string,
  strikePrice?: number,
}

export type eventForTelegram = {
  size: number | string,
  pair?: string,
  type?: string,
  maturity?: string,
  strikePrice?: number,
  fees?: number | string,
  exerciseValue?: number,
  baseCost?: string | number,
}

export type poolPrice = {
  callPrice: Function,
  putPrice: Function
}

export type assetDecimals = {
  callAsset: Function,
  putAsset: Function,
  contract: Function,
}

export type ethContractInstance = {
  wethDai?: any,
  wbtcDai?: any,
  linkDai?: any,
  alethAlusd?: any,
  alcxDai?: any,
  yfiDai?: any,
  lunaDai?: any
}

export type arbiContractInstance = {
  wethDai: any,
  wbtcDai: any,
  linkDai: any,
  yfiDai?: any
}

export type ftmContractInstance = {
  wethUsdc: any,
  wbtcUsdc: any,
  wftmUsdc: any,
  yfiUsdc: any
}