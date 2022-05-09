import { fixedToNumber, parseTokenId, TokenType } from "@premia/utils";
import { envConfig } from "../config/env";
import { assetDecimals, event, poolPrice } from "../models/models";
import { arbiColor, arbiMainnet, arbiScanTx, deposit, endpoint, ethColor, etherScanTx, ethMainnet, exercise, http, purchase, roundTo5, withdraw, multiply, cache, ftmColor, ftmScanTx } from "../utils/utils";
import { BigNumber } from "ethers";

export default class eightDecimalPool {
  pair: string;
  web3PoolInstance: any;
  network: string;
  blockHeight: number;
  callPrice: Function;
  putPrice: Function;
  callAssetDecimalFormat: Function;
  putAssetDecimalFormat: Function; 
  contractDecimalFormat : Function;
  constructor(name: string, web3PoolInstance: any, network: string, blockHeight, prices: poolPrice, decimals:assetDecimals) {
    this.pair = name;
    this.web3PoolInstance = web3PoolInstance;
    this.network = network;
    this.blockHeight = blockHeight;
    this.callPrice = prices.callPrice;
    this.putPrice = prices.putPrice;
    this.callAssetDecimalFormat = decimals.callAsset;
    this.putAssetDecimalFormat = decimals.putAsset;
    this.contractDecimalFormat = decimals.contract;
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
        contractSize: event.returnValues[`2`],
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
        contractSize: event.returnValues[`2`],
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
        amount: event.returnValues[`1`] == true ? this.callAssetDecimalFormat(event.returnValues[`2`]) : this.putAssetDecimalFormat(event.returnValues[`2`]),
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
        amount: event.returnValues[`1`] == true ? this.callAssetDecimalFormat(event.returnValues[`3`]) : this.putAssetDecimalFormat(event.returnValues[`3`])
      }
      this.sendNotification(withdraw, eventData, network);
    })
      .on('changed', changed => console.log(changed))
      .on('error', err => console.log(err))
      .on('connected', str => console.log(str))
  }


  private async sendNotification(actions: string, eventData: event, networks: string) {
    if (cache.get(eventData.txHash) === undefined) {
      cache.set(eventData.txHash, true);
      let content: string;
      let networkColor = this.network == ethMainnet ? ethColor : this.network == arbiMainnet ? arbiColor : ftmColor;
      let networkTx = this.network == ethMainnet ? etherScanTx : this.network == arbiMainnet ? arbiScanTx : ftmScanTx;
      try {
        if (actions === deposit) {
          const unit = eventData.type == 'Call' ? this.pair.split("/")[0] : this.pair.split("/")[1]
          let content;
          if (unit == this.pair.split("/")[0]) {
            const priceNow = roundTo5(await this.callPrice());
            const priceAmountNow = multiply(priceNow, eventData.amount);
            if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
              content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :rocket:)`;
            } else {
              content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
            }
          }
          else {
            const priceNow = roundTo5(await this.putPrice());
            const priceAmountNow = multiply(priceNow, eventData.amount);
            if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
              content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :rocket:)`;
            } else {
              content = `${networkColor} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
            }
          }
          await http.get(
            `${endpoint}${this.network} New Deposit ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} txHash:${networkTx}${eventData.txHash}`
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
                "url": `${networkTx}${eventData.txHash}`
              }]
            }
          )

        }
        if (actions === withdraw) {
          const unit = eventData.type == 'Call' ? this.pair.split("/")[0] : this.pair.split("/")[1]
          let content;
          if (unit == this.pair.split("/")[0]) {
            const priceNow = roundTo5(await this.callPrice());
            const priceAmountNow = multiply(priceNow, eventData.amount);
            if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
              content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :expressionless:)`;
            } else {
              content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
            }
          }
          else {
            const priceNow = roundTo5(await this.putPrice());
            const priceAmountNow = multiply(priceNow, eventData.amount);
            if (priceAmountNow >= parseInt(envConfig.filterPrice)) {
              content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $ :expressionless:)`;
            } else {
              content = `${networkColor} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} (${priceAmountNow} $)`;
            }
          }
          await http.get(
            `${endpoint}${this.network} New Withdrawal ${this.pair.split("/")[0]} : ${eventData.type} Pool amount: ${roundTo5(eventData.amount)} ${unit} txHash:${networkTx}${eventData.txHash}`
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
                "url": `${networkTx}${eventData.txHash}`
              }]
            }
          )
        }
        if (actions === purchase) {
          const { tokenType, maturity, strike64x64 } = parseTokenId(BigNumber.from(eventData.longTokenId).toHexString());
          eventData.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
          eventData.maturity = new Date(maturity.toNumber() * 1000).toDateString();
          eventData.strikePrice = fixedToNumber(strike64x64);
          eventData.strikePrice = roundTo5(eventData.strikePrice);
          eventData.contractSize = roundTo5(this.contractDecimalFormat(BigNumber.from(eventData.contractSize)));
          const priceNow = roundTo5((await this.callPrice()));
          const priceSizeNow = multiply(priceNow, eventData.contractSize);
          eventData.baseCost = eventData.type == `long Call` ? roundTo5(this.callAssetDecimalFormat(BigNumber.from(eventData.baseCost))) : roundTo5(this.putAssetDecimalFormat(BigNumber.from(eventData.baseCost)));
          eventData.feeCost = eventData.type == `long Call` ? roundTo5(this.callAssetDecimalFormat(BigNumber.from(eventData.feeCost))) : roundTo5(this.putAssetDecimalFormat(BigNumber.from(eventData.feeCost)));
          const breakEven = tokenType === TokenType.LongCall ? roundTo5(eventData.strikePrice + (multiply((eventData.baseCost + eventData.feeCost), priceNow) / eventData.contractSize)) : roundTo5(eventData.strikePrice - ((eventData.baseCost + eventData.feeCost) / eventData.contractSize))
          const premiumPriceNow = eventData.type == `long Call` ? multiply(eventData.baseCost, priceNow) : eventData.baseCost;
          const feesPriceNow = eventData.type == `long Call` ? multiply(eventData.feeCost, priceNow) : eventData.feeCost
          if (priceSizeNow >= parseInt(envConfig.filterSizePrice)) {
            content = `${networkColor} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $ :rocket:) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow}$) feesPaid: ${feesPriceNow}$ `;
          } else {
            content = `${networkColor} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow} $) feesPaid: ${feesPriceNow}$ `;
          }
          await http.get(
            `${endpoint}${this.network} New Purchase ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) strike: ${eventData.strikePrice} maturity: ${eventData.maturity} breakeven: ${breakEven} premium: ${eventData.baseCost} (${premiumPriceNow} $) feesPaid: ${feesPriceNow}$  txHash:${networkTx}${eventData.txHash}`
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
                "url": `${networkTx}${eventData.txHash}`
              }]
            }
          )
        }
        if (actions === exercise) {
          const { tokenType } = parseTokenId(BigNumber.from(eventData.longTokenId).toHexString());
          eventData.type = tokenType === TokenType.LongCall ? `long Call` : tokenType === TokenType.LongPut ? `long Put` : `Not Supported`
          eventData.contractSize = roundTo5(this.contractDecimalFormat(BigNumber.from(eventData.contractSize)));
          eventData.fee = eventData.type === 'Long Call' ? this.callAssetDecimalFormat(BigNumber.from(eventData.fee)) : this.putAssetDecimalFormat(BigNumber.from(eventData.fee));
          eventData.fee = roundTo5(eventData.fee as number) // round off to 5 decimal places
          eventData.exerciseValue = tokenType === TokenType.LongCall ? roundTo5(this.callAssetDecimalFormat(BigNumber.from(eventData.exerciseValue))) : roundTo5(this.putAssetDecimalFormat(BigNumber.from(eventData.exerciseValue)));
          const unit = eventData.type === `long Call` ? this.pair.split("/")[0] : this.pair.split("/")[1]
          let content;
          const priceSizeNow = multiply((await this.callPrice()), <number>eventData.contractSize);
          if (priceSizeNow >= parseInt(envConfig.filterSizePrice)) {
            content = `${networkColor} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $ :rocket:) exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit}`;
          } else {
            content = `${networkColor} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} (${priceSizeNow} $) exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit}`;
          }
          await http.get(
            `${endpoint}${this.network} New Exercise ${this.pair} ${eventData.type} size: ${eventData.contractSize} exerciseValue: ${eventData.exerciseValue} fees: ${eventData.fee} ${unit} txHash:${networkTx}${eventData.txHash}`
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
                "url": `${networkTx}${eventData.txHash}`
              }]
            }
          )
        }
      } catch (e) {
        console.log(e);
      }
    }
  }


}