import { arbiContractInstance, ethContractInstance, eventForTelegram, eventPurchase } from "../models/models";
import { fixedToNumber, parseTokenId, TokenType } from '@premia/utils'
import { bnToNumber, bnToNumberBTC, endpoint, arbiScanTx, http, roundTo5, etherScanTx, ethMainnet, arbiMainnet, arbiColor, ethColor } from "../utils/utils";
import { getDAIPrice, getEthPrice, getLinkPrice, getWbtcPrice } from "./chainlink-price";
import { envConfig } from "../config/env";
import { BigNumber } from "ethers";


async function sendPurchaseNotification(data: eventPurchase, pair: string, network: string) {
  try {
    let constructEvent: eventForTelegram = {
      size: roundTo5(data.contractSize),
      pair
    }
    const { tokenType, maturity, strike64x64 } = parseTokenId(BigNumber.from(data.longTokenId).toHexString());
    constructEvent.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
    constructEvent.maturity = new Date(maturity.toNumber() * 1000).toDateString();
    constructEvent.strikePrice = fixedToNumber(strike64x64);
    constructEvent.baseCost = pair === 'WBTC/DAI' && constructEvent.type ==`long Call` ? roundTo5(bnToNumberBTC(BigNumber.from(data.baseCost))) : roundTo5(bnToNumber(BigNumber.from(data.baseCost)));
    
    await http.get(
      `${endpoint}${network} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} txHash:${network == ethMainnet ? etherScanTx : arbiScanTx}${data.txHash}`
    )
    let content;
    let networkColor = network == ethMainnet ? ethColor : arbiColor;
    switch (pair) {
      case "WBTC/DAI": {
        const priceNow = roundTo5((await getWbtcPrice()) * <number>constructEvent.size);
        const premiumPriceNow = constructEvent.type == `long Call`? roundTo5(constructEvent.baseCost * (await getWbtcPrice())) : constructEvent.baseCost;
        if (priceNow >= parseInt(envConfig.filterSizePrice)) {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $ :rocket:) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow}$)`;
        } else {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow} $)`;
        }
        break;
      }
      case "WETH/DAI": {
        const priceNow = roundTo5((await getEthPrice()) * <number>constructEvent.size);
        const premiumPriceNow = constructEvent.type == `long Call`? roundTo5(constructEvent.baseCost * (await getEthPrice())) : constructEvent.baseCost;
        if (priceNow >= parseInt(envConfig.filterSizePrice)) {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $ :rocket:) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow} $)`;
        } else {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow} $)`;
        }
        break;
      }
      case "LINK/DAI": {
        const priceNow = roundTo5((await getLinkPrice()) * <number>constructEvent.size);
        const premiumPriceNow = constructEvent.type == `long Call`? roundTo5(constructEvent.baseCost * (await getLinkPrice())) : constructEvent.baseCost;
        if (priceNow >= parseInt(envConfig.filterSizePrice)) {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $ :rocket:) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow} $)`;
        } else {
          content = `${networkColor} New Purchase ${constructEvent.pair} ${constructEvent.type} size: ${constructEvent.size} (${priceNow} $) strike: ${constructEvent.strikePrice} maturity: ${constructEvent.maturity} premium: ${constructEvent.baseCost} (${premiumPriceNow} $)`;
        }
        break;
      }
      default: {
        console.log("not supported pair", pair);
      }
    }
    await http.post(
      envConfig.discordWebHookUrl,
      {
        headers: {
          'Content-type': 'application/json'
        },
        username: "Premia-Insights",
        avatar_url: "",
        content: content,
        embeds: [{
          "title": "TxHash",
          "url": `${network == ethMainnet ? etherScanTx : arbiScanTx}${data.txHash}`
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
      sendPurchaseNotification(eventData, el.pair, ethMainnet);
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
      sendPurchaseNotification(eventData, el.pair, arbiMainnet);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  })
}
