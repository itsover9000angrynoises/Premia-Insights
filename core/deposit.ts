import { envConfig } from "../config/env";
import { eventDeposit } from "../models/models";
import {bnToNumber, bnToNumberBTC, endpoint } from "../utils/utils";




async function sendDepositNotificationETH(data: eventDeposit, http: any) {
  try {
    const unit = data.type == 'Call' ? 'WETH' : 'DAI'
    await http.get(
      `${endpoint}New Deposit WETH : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Deposit WETH : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}
async function sendDepositNotificationBTC(data: eventDeposit, http: any) {
  try {
    const unit = data.type == 'Call' ? 'WBTC' : 'DAI'
    await http.get(
      `${endpoint}New Deposit WBTC : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Deposit WBTC : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}
async function sendDepositNotificationLINK(data: eventDeposit, http: any) {
  try {
    const unit = data.type == 'Call' ? 'LINK' : 'DAI'
    await http.get(
      `${endpoint}New Deposit LINK : ${data.type} Pool amount: ${data.amount} ${unit}`
    )
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: `New Deposit LINK : ${data.type} Pool amount: ${data.amount} ${unit}`
      }
    )
  } catch (e) {
    console.log(e);
  }
}

export function startDeposit(web3: any, http: any, wethDai: any, linkDai: any, wbtcDai: any) {
  wethDai.events.Deposit({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventDeposit = {
      type: event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: bnToNumber(event.returnValues[`2`])
    }
    sendDepositNotificationETH(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  linkDai.events.Deposit({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventDeposit = {
      type: event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: bnToNumber(event.returnValues[`2`])
    }
    sendDepositNotificationLINK(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))

  wbtcDai.events.Deposit({
    filter: {
      value: [],
    },
    fromBlock: envConfig.startBlocKHeight
  }).on('data', event => {
    let eventData: eventDeposit = {
      type: event.returnValues[`1`] == true ? 'Call' : 'Put',
      amount: event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`2`]) : bnToNumber(event.returnValues[`2`])
    }
    sendDepositNotificationBTC(eventData, http);
  })
    .on('changed', changed => console.log(changed))
    .on('error', err => console.log(err))
    .on('connected', str => console.log(str))
}
