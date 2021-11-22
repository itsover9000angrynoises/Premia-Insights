import { envConfig } from "../config/env";
import { eventWithdrawal } from "../models/models";
import { bnToNumber, bnToNumberBTC, endpoint, roundTo5 } from "../utils/utils";


async function sendDepositNotification(data: eventWithdrawal, http: any, pair: string) {
  try {
    const unit = data.type == 'Call' ? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}


export function startWithdrawal(http: any, wethDai: any, linkDai: any, wbtcDai: any){
  [
    {pool: wethDai, pair: 'WETH/DAI'},
    {pool: linkDai, pair: 'LINK/DAI'},
    {pool: wbtcDai, pair: 'WBTC/DAI'}
  ].forEach(el => {
    el.pool.events.Withdrawal({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeight
    }).on('data', event => {
      let eventData: eventWithdrawal = {
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' ? bnToNumberBTC(event.returnValues[`3`]) : bnToNumber(event.returnValues[`3`]),
      }
      sendDepositNotification(eventData, http, el.pair);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
