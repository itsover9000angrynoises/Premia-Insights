import { envConfig } from "../config/env";
import { eventDeposit } from "../models/models";
import {bnToNumber, bnToNumberBTC, endpoint, roundTo5 } from "../utils/utils";



async function sendDepositNotification(data: eventDeposit, http: any, pair: string) {
  try {
    const unit = data.type == 'Call' ? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}New Deposit ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Deposit ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}


export function startDeposit(http: any, wethDai: any, linkDai: any, wbtcDai: any) {
  [
    {pool: wethDai, pair: 'WETH/DAI'},
    {pool: linkDai, pair: 'LINK/DAI'},
    {pool: wbtcDai, pair: 'WBTC/DAI'}
  ].forEach(el => {
    el.pool.events.Deposit({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeight
    }).on('data', event => {
      let eventData: eventDeposit = {
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`]),
      }
      sendDepositNotification(eventData, http, el.pair);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
