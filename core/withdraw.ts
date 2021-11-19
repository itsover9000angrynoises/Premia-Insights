import { envConfig } from "../config/env";
import { eventWithdrawal } from "../models/models";
import { bnToNumber, bnToNumberBTC, endpoint } from "../utils/utils";




async function sendWithdrawalNotificationETH(data: eventWithdrawal,http:any){
  try {
    const unit = data.type == 'Call' ? 'WETH':'DAI'
    await http.get(
      `${endpoint}New Withdrawal WETH : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Withdrawal WETH : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}
async function sendWithdrawalNotificationBTC(data: eventWithdrawal,http:any){
  try {
    const unit = data.type == 'Call' ? 'WBTC':'DAI'
    await http.get(
      `${endpoint}New Withdrawal WBTC : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Withdrawal WBTC : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}
async function sendWithdrawalNotificationLINK(data: eventWithdrawal,http:any){
  try {
    const unit = data.type == 'Call' ? 'LINK':'DAI'
    await http.get(
      `${endpoint}New Withdrawal LINK : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Withdrawal LINK : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}

export function startWithdrawal(web3: any, http: any, wethDai: any, linkDai: any, wbtcDai: any){
  wethDai.events.Withdrawal({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {    
    let eventData: eventWithdrawal = {
      type : event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: bnToNumber(event.returnValues[`3`])
    }
    sendWithdrawalNotificationETH(eventData,http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  linkDai.events.Withdrawal({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventWithdrawal = {
      type : event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: bnToNumber(event.returnValues[`3`])
    }
    sendWithdrawalNotificationLINK(eventData,http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  wbtcDai.events.Withdrawal({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventWithdrawal = {
      type : event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`3`]): bnToNumber(event.returnValues[`3`])
    }
    sendWithdrawalNotificationBTC(eventData,http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))
}
