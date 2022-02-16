import { fixedToNumber, parseTokenId, TokenType } from "@premia/utils";
import { envConfig } from "../config/env";
import { event } from "../models/models";
import { arbiColor, arbiMainnet, arbiScanTx, bnToNumber, deposit, endpoint, ethColor, etherScanTx, ethMainnet, exercise, http, purchase, roundTo5, withdraw } from "../utils/utils";
import { getDAIPrice,getAlcxPrice } from "./chainlink-price";
import { BigNumber } from "ethers";

export default class alcxdai {
  pair = 'ALCX/DAI';
  web3PoolInstance: any;
  network: string;
  blockHeight: number;
  constructor(web3PoolInstance: any, network: string, blockHeight) {
    this.web3PoolInstance = web3PoolInstance;
    this.network = network;
    this.blockHeight = blockHeight;
  }

  async start() {
    this.purchase(this.web3PoolInstance, this.network);
    this.deposit(this.web3PoolInstance, this.network);
    this.exercise(this.web3PoolInstance, this.network);
    this.withdraw(this.web3PoolInstance, this.network);
  }

  private purchase(web3PoolInstance: any, network: string) {
    web3PoolInstance.events.Purchase({
      filter: {
        value: [],
      },
      fromBlock: this.blockHeight
    }).on('data', event => {
      let eventData: event = {
        txHash: event.transactionHash,
        account: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: roundTo5(bnToNumber(BigNumber.from((event.returnValues[`2`])))),
        baseCost: event.returnValues[`3`],
        feeCost: event.returnValues[`4`],
        newPrice64x64: event.returnValues[`5`]
      }      
      this.sendNotification(purchase, eventData, network);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  }

  private exercise(web3PoolInstance: any, network: string) {
    web3PoolInstance.events.Exercise({
      filter: {
        value: [],
      },
      fromBlock: this.blockHeight
    }).on('data', event => {
      let eventData: event = {
        txHash: event.transactionHash,
        user: event.returnValues[`0`],
        longTokenId: event.returnValues[`1`],
        contractSize: roundTo5(bnToNumber(BigNumber.from((event.returnValues[`2`])))),
        exerciseValue: event.returnValues[`3`],
        fee: event.returnValues[`4`],
      }
      this.sendNotification(exercise, eventData, network);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  }

  private deposit(web3PoolInstance: any, network: string) {
    web3PoolInstance.events.Deposit({
      filter: {
        value: [],
      },
      fromBlock: this.blockHeight
    }).on('data', event => {
      let eventData: event = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: roundTo5(bnToNumber(BigNumber.from((event.returnValues[`2`])))),
      }
      this.sendNotification(deposit, eventData, network);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  }

  private withdraw(web3PoolInstance: any, network: string) {
    web3PoolInstance.events.Withdrawal({
      filter: {
        value: [],
      },
      fromBlock: this.blockHeight
    }).on('data', event => {
      let eventData: event = {
        txHash: event.transactionHash,
        type: event.returnValues[`1`] == true ? 'Call' : 'Put',
        amount: roundTo5(bnToNumber(BigNumber.from((event.returnValues[`3`]))))
      }
      this.sendNotification(withdraw, eventData, network);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  }


  private async sendNotification(actions: string, eventData: event, networks: string) {
    let content: string;
    let networkColor = networks == ethMainnet ? ethColor : arbiColor;
    try {
      if (actions === deposit) {
        const unit = eventData.type == 'Call' ? this.pair.split("/")[0] : this.pair.split("/")[1]
        let content;
        if (unit == this.pair.split("/")[0]) {
          const priceNow = roundTo5(await getAlcxPrice());
          const priceAmountNow = priceNow * eventData.amount;
          if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
            content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :rocket:)`;
          } else {
            content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
          }
        }
        else {
          const priceNow = roundTo5(await getDAIPrice());
          const priceAmountNow = priceNow * eventData.amount;
          if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
            content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :rocket:)`;
          } else {
            content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
          }
        }
        await http.get(
          `${endpoint}${this.network == ethMainnet ? ethMainnet : arbiMainnet} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} txHash:${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
        )
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
              "url": `${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
            }]
          }
        )

      }
      if (actions === withdraw) {
        const unit = eventData.type == 'Call' ? this.pair.split("/")[0] : this.pair.split("/")[1]
        let content;
        if (unit == this.pair.split("/")[0]) {
          const priceNow = roundTo5(await getAlcxPrice());
          const priceAmountNow = priceNow * eventData.amount;
          if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
            content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :expressionless:)`;
          } else {
            content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
          }
        }
        else {
          const priceNow = roundTo5(await getDAIPrice());
          const priceAmountNow = priceNow * eventData.amount;
          if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
            content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :expressionless:)`;
          } else {
            content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
          }
        }
        await http.get(
          `${endpoint}${this.network == ethMainnet ? ethMainnet : arbiMainnet} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} txHash:${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
        )
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
              "url": `${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
            }]
          }
        )
      }
      if (actions === purchase) {
        const priceNow = roundTo5((await getAlcxPrice()));
        const priceSizeNow = roundTo5(priceNow * eventData.contractSize);
        const { tokenType, maturity, strike64x64 } = parseTokenId(BigNumber.from(eventData.longTokenId).toHexString());
        eventData.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
        eventData.maturity = new Date(maturity.toNumber() * 1000).toDateString();
        eventData.strikePrice = fixedToNumber(strike64x64);
        eventData.baseCost =roundTo5(bnToNumber(BigNumber.from(eventData.baseCost)));
        eventData.feeCost = roundTo5(bnToNumber(BigNumber.from(eventData.feeCost)));
        const breakEven = tokenType === TokenType.LongCall ? roundTo5(eventData.strikePrice + (((eventData.baseCost + eventData.feeCost) * priceNow) / eventData.contractSize)) : roundTo5(eventData.strikePrice - ((eventData.baseCost + eventData.feeCost) / eventData.contractSize));
        const premiumPriceNow = eventData.type == `long Call` ? roundTo5(eventData.baseCost * priceNow) : eventData.baseCost;
        const feesPriceNow = eventData.type == `long Call` ? roundTo5(eventData.feeCost * priceNow) : eventData.feeCost
        if (priceSizeNow >= parseInt(envConfig.filterSizePrice)) {
          content = `${networkColor} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $ :rocket:) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow}$) feesPaid: ${feesPriceNow}$ `;
        } else {
          content = `${networkColor} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow} $) feesPaid: ${feesPriceNow}$ `;
        }
        await http.get(
          `${endpoint}${this.network == ethMainnet ? ethMainnet : arbiMainnet} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow} $) feesPaid: ${feesPriceNow}$  txHash:${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
        );
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
              "url": `${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
            }]
          }
        )
      }
      if (actions === exercise) {
        const { tokenType } = parseTokenId(BigNumber.from(eventData.longTokenId).toHexString());
        eventData.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
        eventData.fee = roundTo5(bnToNumber(BigNumber.from(eventData.fee)));
        eventData.exerciseValue = roundTo5(bnToNumber(BigNumber.from(eventData.exerciseValue)));
        const unit = eventData.type === `long Call` ? this.pair.split("/")[0] : this.pair.split("/")[1]
        let content;
        const priceSizeNow = roundTo5((await getAlcxPrice()) * <number>eventData.contractSize);
        if (priceSizeNow >= parseInt(envConfig.filterSizePrice)) {
          content = `${networkColor} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $ :rocket:) exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit}`;
        } else {
          content = `${networkColor} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit}`;
        }
        await http.get(
          `${endpoint}${this.network == ethMainnet ? ethMainnet : arbiMainnet} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit} txHash:${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
        )
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
              "url": `${this.network == ethMainnet ? etherScanTx : arbiScanTx}${eventData.txHash}`
            }]
          }
        )
      }
    } catch (e) {
      console.log(e);
    }
  }
}