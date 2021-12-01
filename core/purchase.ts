import { arbiContractInstance, ethContractInstance, eventForTelegram, eventPurchase } from "../models/models";
import { fixedToNumber, parseTokenId, TokenType } from '@premia/utils'
import { bnToNumber, bnToNumberBTC, endpoint, arbiScanTx, http, etherScanTx, ethMainnet, arbiMainnet } from "../utils/utils";
import { envConfig } from "../config/env";
import {BigNumber} from "ethers";


async function sendPurchaseNotification(data: eventPurchase, pair: string, network:string) {
  try {
    let constructEvent: eventForTelegram = {
      size: data.contractSize,
      pair
    }
    const {tokenType, maturity, strike64x64} = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.maturity = new Date(maturity.toNumber() * 1000).toDateString();
    constructEvent.strikePrice = fixedToNumber(strike64x64);
    await http.get(
      `${endpoint}${network} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} txHash:${network == ethMainnet ? etherScanTx:arbiScanTx}${data.txHash}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `${network} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity}`,
        embeds: [{
          "title": "TxHash",
          "url": `${network == ethMainnet ? etherScanTx:arbiScanTx}${data.txHash}`
        }]
      }
    )
  } catch (e) {
    console.log(e);
  }
}

export function startPurchase(ethInstance: ethContractInstance, arbiInstance: arbiContractInstance) {
  [
    { pool: ethInstance.wethDai, pair: 'WETH/DAI' },
    { pool: ethInstance.linkDai, pair: 'LINK/DAI' },
    { pool: ethInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Purchase({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightEth
    }).on('data', event => {
      let eventData: eventPurchase = {
        txHash: event.transactionHash,
        account: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: el.pair === 'WBTC/DAI' ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
        baseCost: event.returnValues[`3`],
        feeCost: event.returnValues[`4`],
        newPrice64x64: event.returnValues[`5`]
      }
      sendPurchaseNotification(eventData, el.pair,ethMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  });
  [
    { pool: arbiInstance.wethDai, pair: 'WETH/DAI' },
    { pool: arbiInstance.linkDai, pair: 'LINK/DAI' },
    { pool: arbiInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Purchase({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightArbi
    }).on('data', event => {
      let eventData: eventPurchase = {
        txHash: event.transactionHash,
        account: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: el.pair === 'WBTC/DAI' ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
        baseCost: event.returnValues[`3`],
        feeCost: event.returnValues[`4`],
        newPrice64x64: event.returnValues[`5`]
      }
      sendPurchaseNotification(eventData, el.pair,arbiMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
