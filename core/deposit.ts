import { envConfig } from "../config/env";
import { arbiContractInstance, ethContractInstance, eventDeposit } from "../models/models";
import {bnToNumber, bnToNumberBTC, endpoint, arbiScanTx, http, roundTo5, etherScanTx, ethMainnet, arbiMainnet } from "../utils/utils";



async function sendDepositNotification(data: eventDeposit,pair: string,network :string) {
  try {
    const unit = data.type == 'Call' ? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}${network} New Deposit ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} txHash:${network == ethMainnet ? etherScanTx:arbiScanTx}${data.txHash}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `${network} New Deposit ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`,
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


export function startDeposit(ethInstance:ethContractInstance, arbiInstance: arbiContractInstance) {
  [
    { pool: ethInstance.wethDai, pair: 'WETH/DAI' },
    { pool: ethInstance.linkDai, pair: 'LINK/DAI' },
    { pool: ethInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Deposit({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightEth
    }).on('data', event => {
      let eventData: eventDeposit = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
      }
      sendDepositNotification(eventData,el.pair,ethMainnet);
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
    el.pool.events.Deposit({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightArbi
    }).on('data', event => {
      let eventData: eventDeposit = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
      }
      sendDepositNotification(eventData,el.pair,arbiMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  });
}
