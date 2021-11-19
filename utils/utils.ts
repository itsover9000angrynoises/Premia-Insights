import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { envConfig } from '../config/env';

export function bnToNumber(bn: BigNumber) {
  return Number(formatUnits(bn, 18));
}
export function bnToNumberBTC(bn: BigNumber) {
  return Number(formatUnits(bn, 8));
}

export const endpoint = `https://api.telegram.org/bot${envConfig.telegramBotApiKey}/sendMessage?chat_id=${envConfig.telegramChannelName}&text=`
