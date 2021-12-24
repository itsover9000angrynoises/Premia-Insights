import { envConfig } from "../config/env";
import { arbiContractInstance, ethContractInstance, eventWithdrawal } from "../models/models";
import {bnToNumber, bnToNumberBTC, endpoint, arbiScanTx, http, roundTo5, etherScanTx, ethMainnet, arbiMainnet, arbiColor, ethColor } from "../utils/utils";
import { getDAIPrice, getEthPrice, getLinkPrice, getWbtcPrice } from "./chainlink-price";

async function sendWithdrawNotification(data: eventWithdrawal, pair: string, network : string) {
  try {
    const unit = data.type == 'Call' ? pair.split("/")[0] : 'DAI'
    await http.get(
      `${endpoint}${network} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} txHash:${network == ethMainnet ? etherScanTx:arbiScanTx}${data.txHash}`
    )
    let content;
    let networkColor = network == ethMainnet ? ethColor: arbiColor; 
    switch(unit){
      case "WBTC" :{
        const priceNow = roundTo5((await getWbtcPrice())*data.amount);
        if( priceNow >= parseInt(envConfig.filterPrice)){
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $ :expressionless:)`;
        }else{
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $)`;
        }
        break;
      }
      case "WETH" :{
        const priceNow = roundTo5((await getEthPrice())*data.amount);
        if( priceNow >= parseInt(envConfig.filterPrice)){
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $ :expressionless:)`;
        }else{
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $)`;
        }
        break;
      }
      case "LINK" :{
        const priceNow = roundTo5((await getLinkPrice())*data.amount);
        if( priceNow >= parseInt(envConfig.filterPrice)){
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $ :expressionless:)`;
        }else{
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $)`;
        }
        break;
      }
      case "DAI" :{
        const priceNow = roundTo5((await getDAIPrice())*data.amount);
        if( priceNow >= parseInt(envConfig.filterPrice)){
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $ :expressionless:)`;
        }else{
          content=`${networkColor} New Withdrawal ${pair.split("/")[0]} : ${data.type} Pool amount: ${roundTo5(data.amount)} ${unit} (${priceNow} $)`;
        }
        break;
      }
      default :{
        console.log("not supported unit", unit);
      }
    }
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers:{
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: content,
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


export function startWithdrawal(ethInstance:ethContractInstance, arbiInstance: arbiContractInstance){
  [
    { pool: ethInstance.wethDai, pair: 'WETH/DAI' },
    { pool: ethInstance.linkDai, pair: 'LINK/DAI' },
    { pool: ethInstance.wbtcDai, pair: 'WBTC/DAI' }
  ].forEach(el => {
    el.pool.events.Withdrawal({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightEth
    }).on('data', event => {
      let eventData: eventWithdrawal = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`3`]) : bnToNumber(event.returnValues[`3`])
      }
      sendWithdrawNotification(eventData, el.pair,ethMainnet);
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
    el.pool.events.Withdrawal({
      filter: {
        value: [],
      },
      fromBlock: envConfig.startBlocKHeightArbi
    }).on('data', event => {
      let eventData: eventWithdrawal = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: el.pair === 'WBTC/DAI' && event.returnValues[`1`] == true ? bnToNumberBTC(event.returnValues[`3`]) : bnToNumber(event.returnValues[`3`])
      }
      sendWithdrawNotification(eventData, el.pair,arbiMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
