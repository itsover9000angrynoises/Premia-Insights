var Web3 = require("web3");
import axios from 'axios';
import { diamondProxyABI, envConfig, linkDaiAddress, wbtcDaiAddress, wethDaiAddress } from './config/env';
import { startDeposit } from './core/deposit';
import { startPurchase } from './core/purchase';
import { startWithdrawal } from './core/withdraw';
var rateLimit = require('axios-rate-limit');

const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 5000 });

var getProvider = () => {
  const provider = new Web3.providers.WebsocketProvider(envConfig.WSSEndpoint, {
    // @ts-ignore
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000
    },
    reconnect: {
      auto: true,
      delay: 5000,
      maxAttempts: 5,
      onTimeout: false
    }
  });
  provider.on("connect", () => {
    console.log("*** WebSocket Connected ***")
  })
  provider.on("error", (e) => {
    console.log("*** WebSocket Error ***")
    getProvider()
  })
  provider.on("end", (e) => {
    console.log("*** WebSocket Ended ***")
    getProvider()
  })
  provider.on("close", (e) => {
    console.log("*** WebSocket Closed ***")
    getProvider()
  })
  provider.on("timeout", (e) => {
    console.log("*** WebSocket Timeout ***")
    getProvider()
  })
  provider.on("exit", (e) => {
    console.log("*** WebSocket Exit ***")
    getProvider()
  })
  provider.on("ready", (e) => {
    //console.log('*** WebSocket Ready ***')
  })
  return provider
}

var web3 = new Web3(getProvider())

const wethDai = new web3.eth.Contract(diamondProxyABI,
  wethDaiAddress
);
const wbtcDai = new web3.eth.Contract(diamondProxyABI,
  wbtcDaiAddress
);
const linkDai = new web3.eth.Contract(diamondProxyABI,
  linkDaiAddress
);


function start() {
  startPurchase(web3, http, wethDai, linkDai, wbtcDai);
  startDeposit(web3, http, wethDai, linkDai, wbtcDai);
  startWithdrawal(web3, http, wethDai, linkDai, wbtcDai);
};


start();