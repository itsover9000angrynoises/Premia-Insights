import { eventForTelegram, eventPurchase } from "../models/models";
import { fixedToNumber, parseTokenId, TokenType } from '@premia/utils'
import { bnToNumber, bnToNumberBTC, endpoint } from "../utils/utils";
import { envConfig } from "../config/env";
import {BigNumber} from "ethers";


let poolViewContract: any;
async function sendNotificationETH(data: eventPurchase, http: any) {
  try {
    let constructEvent: eventForTelegram = {
      size: data.contractSize,
      pair: `WETH/DAI`
    }
    const {tokenType, maturity, strike64x64} = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.maturity = new Date(maturity.toNumber() * 1000).toDateString();
    constructEvent.strikePrice = fixedToNumber(strike64x64);
    await http.get(
      `${endpoint}New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}

async function sendNotificationLINK(data: eventPurchase, http: any) {
  try {
    let constructEvent: eventForTelegram = {
      size: data.contractSize,
      pair: `LINK/DAI`
    }
    const {tokenType, maturity, strike64x64} = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.maturity = new Date(maturity.toNumber() * 1000).toDateString();
    constructEvent.strikePrice = fixedToNumber(strike64x64);
    await http.get(
      `${endpoint}New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}

async function sendNotificationBTC(data: eventPurchase, http: any) {
  try {
    let constructEvent: eventForTelegram = {
      size: data.contractSize,
      pair: `WBTC/DAI`
    }
    const {tokenType, maturity, strike64x64} = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.maturity = new Date(maturity.toNumber() * 1000).toDateString();
    constructEvent.strikePrice = fixedToNumber(strike64x64);
    await http.get(
      `${endpoint}New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size.toLocaleString()} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers: {
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size.toLocaleString()} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}



export function startPurchase(web3: any, http: any, wethDai: any, linkDai: any, wbtcDai: any) {
  const poolView = '0x14AC2DA11C2CF07eA4c64C83BE108b8F11e48F20'
  poolViewContract = new web3.eth.Contract([{ "inputs": [{ "internalType": "address", "name": "nftDisplay", "type": "address" }, { "internalType": "address", "name": "ivolOracle", "type": "address" }, { "internalType": "address", "name": "weth", "type": "address" }, { "internalType": "address", "name": "premiaMining", "type": "address" }, { "internalType": "address", "name": "feeReceiver", "type": "address" }, { "internalType": "address", "name": "feeDiscountAddress", "type": "address" }, { "internalType": "int128", "name": "fee64x64", "type": "int128" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "shortTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Annihilate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "underwriter", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "shortTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "freedAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "intervalContractSize", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "AssignExercise", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isCallPool", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "longTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "contractSize", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "exerciseValue", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "Exercise", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bool", "name": "isCallPool", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "FeeWithdrawal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "longTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "contractSize", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "baseCost", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feeCost", "type": "uint256" }, { "indexed": false, "internalType": "int128", "name": "spot64x64", "type": "int128" }], "name": "Purchase", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }, { "indexed": false, "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "TransferBatch", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "TransferSingle", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "underwriter", "type": "address" }, { "indexed": true, "internalType": "address", "name": "longReceiver", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "shortTokenId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "intervalContractSize", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "intervalPremium", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "isManualUnderwrite", "type": "bool" }], "name": "Underwrite", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bool", "name": "isCall", "type": "bool" }, { "indexed": false, "internalType": "int128", "name": "cLevel64x64", "type": "int128" }, { "indexed": false, "internalType": "int128", "name": "oldLiquidity64x64", "type": "int128" }, { "indexed": false, "internalType": "int128", "name": "newLiquidity64x64", "type": "int128" }], "name": "UpdateCLevel", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "int128", "name": "steepness64x64", "type": "int128" }], "name": "UpdateSteepness", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isCallPool", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "depositedAt", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdrawal", "type": "event" }, { "inputs": [{ "internalType": "bool", "name": "isCall", "type": "bool" }], "name": "getCLevel64x64", "outputs": [{ "internalType": "int128", "name": "", "type": "int128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getCapAmounts", "outputs": [{ "internalType": "uint256", "name": "callTokenCapAmount", "type": "uint256" }, { "internalType": "uint256", "name": "putTokenCapAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getDivestmentTimestamps", "outputs": [{ "internalType": "uint256", "name": "callDivestmentTimestamp", "type": "uint256" }, { "internalType": "uint256", "name": "putDivestmentTimestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeeReceiverAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMinimumAmounts", "outputs": [{ "internalType": "uint256", "name": "minCallTokenAmount", "type": "uint256" }, { "internalType": "uint256", "name": "minPutTokenAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getParametersForTokenId", "outputs": [{ "internalType": "enum PoolStorage.TokenType", "name": "", "type": "uint8" }, { "internalType": "uint64", "name": "", "type": "uint64" }, { "internalType": "int128", "name": "", "type": "int128" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "getPoolSettings", "outputs": [{ "components": [{ "internalType": "address", "name": "underlying", "type": "address" }, { "internalType": "address", "name": "base", "type": "address" }, { "internalType": "address", "name": "underlyingOracle", "type": "address" }, { "internalType": "address", "name": "baseOracle", "type": "address" }], "internalType": "struct PoolStorage.PoolSettings", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getPremiaMining", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "getPrice", "outputs": [{ "internalType": "int128", "name": "", "type": "int128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getSteepness64x64", "outputs": [{ "internalType": "int128", "name": "", "type": "int128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTokenIds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getTotalTVL", "outputs": [{ "internalType": "uint256", "name": "underlyingTVL", "type": "uint256" }, { "internalType": "uint256", "name": "baseTVL", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserTVL", "outputs": [{ "internalType": "uint256", "name": "underlyingTVL", "type": "uint256" }, { "internalType": "uint256", "name": "baseTVL", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }],
    poolView
  );
  wethDai.events.Purchase({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventPurchase = {
      account: event.returnValues[`0`],
      longTokenId: event.returnValues[`1`],
      contractSize: bnToNumber(event.returnValues[`2`]),
      baseCost: event.returnValues[`3`],
      feeCost: event.returnValues[`4`],
      newPrice64x64: event.returnValues[`5`]
    }
    sendNotificationETH(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  linkDai.events.Purchase({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventPurchase = {
      account: event.returnValues[`0`],
      longTokenId: event.returnValues[`1`],
      contractSize: bnToNumber(event.returnValues[`2`]),
      baseCost: event.returnValues[`3`],
      feeCost: event.returnValues[`4`],
      newPrice64x64: event.returnValues[`5`]
    }
    sendNotificationLINK(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  wbtcDai.events.Purchase({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventPurchase = {
      account: event.returnValues[`0`],
      longTokenId: event.returnValues[`1`],
      contractSize: bnToNumberBTC(event.returnValues[`2`]),
      baseCost: event.returnValues[`3`],
      feeCost: event.returnValues[`4`],
      newPrice64x64: event.returnValues[`5`]
    }
    sendNotificationBTC(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))
}
