import { parseTokenId, TokenType } from "@premia/utils";
import { envConfig } from "../config/env";
import { arbiContractInstance, ethContractInstance, eventExercise, eventForTelegram } from "../models/models";
import { bnToNumber, bnToNumberBTC, endpoint, arbiScanTx, http, roundTo5, etherScanTx, ethMainnet, arbiMainnet } from "../utils/utils";
import { BigNumber } from "ethers";



async function sendExerciseNotification(data: eventExercise, pair: string, network:string) {
  try {
    let constructEvent: eventForTelegram = {
      size: data.contractSize,
      pair
    }
    const { tokenType } = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.fees = pair.split("/")[0] === 'WBTC' && constructEvent.type === 'Long Call' ? bnToNumberBTC(BigNumber.from(data.fee)) : bnToNumber(BigNumber.from(data.fee));
    constructEvent.fees =roundTo5(constructEvent.fees) // round off to 5 decimal places
    constructEvent.exerciseValue = roundTo5(bnToNumber(BigNumber.from(data.exerciseValue)));
    const unit = constructEvent.type === `long Call`? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}${network} New Exercise ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} exerciseValue: ${constructEvent.exerciseValue} fees: ${constructEvent.fees} ${unit} txHash:${network == ethMainnet ? etherScanTx:arbiScanTx}${data.txHash}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers: {
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `${network} New Exercise ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} exerciseValue: ${constructEvent.exerciseValue} fees: ${constructEvent.fees} ${unit}`,
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


export function startExercise(ethInstance:ethContractInstance, arbiInstance: arbiContractInstance) {
  [
    { pool: ethInstance.wethDai, pair: 'WETH/DAI' },
    { pool: ethInstance.linkDai, pair: 'LINK/DAI' },
    { pool: ethInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Exercise({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightEth
    }).on('data', event => {
      let eventData: eventExercise = {
        txHash: event.transactionHash,
        user: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: el.pair === 'WBTC/DAI' ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
        exerciseValue: event.returnValues[`3`],
        fee: event.returnValues[`4`],
      }
      sendExerciseNotification(eventData,el.pair,ethMainnet);
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
    el.pool.events.Exercise({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightArbi
    }).on('data', event => {
      let eventData: eventExercise = {
        txHash: event.transactionHash,
        user: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: el.pair === 'WBTC/DAI' ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
        exerciseValue: event.returnValues[`3`],
        fee: event.returnValues[`4`],
      }
      sendExerciseNotification(eventData,el.pair,arbiMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
