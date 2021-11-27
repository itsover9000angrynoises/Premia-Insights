import { envConfig } from "../config/env";
import { ethContractInstance, eventWithdrawal } from "../models/models";
import { bnToNumber, bnToNumberBTC, endpoint, etherScanTx, http, roundTo5 } from "../utils/utils";


async function sendDepositNotification(data: eventWithdrawal, pair: string) {
  try {
    const unit = data.type == 'Call' ? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} txHash:${etherScanTx}${data.txHash}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`,
        embeds: [{
          "title": "TxHash",
          "url": `${etherScanTx}${data.txHash}`
        }]
      }
    )
  } catch (e) {
    console.log(e);
  }
}


export function startWithdrawal(ethInstance:ethContractInstance){
  [
    { pool: ethInstance.wethDai, pair: 'WETH/DAI' },
    { pool: ethInstance.linkDai, pair: 'LINK/DAI' },
    { pool: ethInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Withdrawal({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeight
    }).on('data', event => {
      let eventData: eventWithdrawal = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`3`]) : bnToNumber(event.returnValues[`3`])
      }
      sendDepositNotification(eventData, el.pair);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
