import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { envConfig, TwitterConfig } from '../config/env';
import axios from 'axios';
import { TwitterApi } from 'twitter-api-v2';
const Cache = require("node-cache");

var rateLimit = require('axios-rate-limit');
export const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 5000 });
export const cache = new Cache({ stdTTL: 43200, checkperiod: 43150 });

export const arbiColor = `\`\`\`ini
[ARBITRUM-MAINNET]
\`\`\``;

export const ethColor = `\`\`\`
[ETH-MAINNET]
\`\`\``;

export const ftmColor = `\`\`\`yaml
[FANTOM-MAINNET]
\`\`\``;

export const optColor = `\`\`\`CSS
[OPTIMISM-MAINNET]
\`\`\``;

export function bnToNumber(bn: BigNumber) {
  return Number(formatUnits(bn, 18));
}
export function bnToNumberBTC(bn: BigNumber) {
  return Number(formatUnits(bn, 8));
}
export function bnToNumberSix(bn: BigNumber) {
  return Number(formatUnits(bn, 6));
}
export function roundTo5(number: number) {
  return (Math.round(number * 100000) / 100000);
}

export function multiply(a: number, b: number) {
  return roundTo5((a * b));
}

export const etherScanTx = 'https://etherscan.io/tx/';
export const arbiScanTx = 'https://arbiscan.io/tx/';
export const ftmScanTx = 'https://ftmscan.com/tx/';
export const optScanTx = 'https://optimistic.etherscan.io/tx/';

export const purchase = 'Purchase';
export const withdraw = 'Withdraw';
export const deposit = 'Deposit';
export const exercise = 'Exercise';

export const ethMainnet: string = 'ETH-MAINNET';
export const arbiMainnet: string = 'ARBITRUM-MAINNET';
export const ftmMainnet: string = 'FANTOM-MAINNET';
export const optMainnet:string = 'OPTIMISM-MAINNET';
export const endpoint = `https://api.telegram.org/bot${envConfig.telegramBotApiKey}/sendMessage?chat_id=${envConfig.telegramChannelName}&text=`
//export const twitterClient = new TwitterApi(TwitterConfig);
