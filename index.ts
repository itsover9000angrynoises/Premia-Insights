var Web3 = require("web3");
import { diamondProxyABI, envConfig, linkDaiAddress, wbtcDaiAddress, wethDaiAddress } from './config/env';
import { startDeposit } from './core/deposit';
import { startExercise } from './core/exercise';
import { startPurchase } from './core/purchase';
import { startWithdrawal } from './core/withdraw';
import { ethContractInstance } from './models/models';


var getETHProvider = () => {
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
    getETHProvider()
  })
  provider.on("end", (e) => {
    console.log("*** WebSocket Ended ***")
    getETHProvider()
  })
  provider.on("close", (e) => {
    console.log("*** WebSocket Closed ***")
    getETHProvider()
  })
  provider.on("timeout", (e) => {
    console.log("*** WebSocket Timeout ***")
    getETHProvider()
  })
  provider.on("exit", (e) => {
    console.log("*** WebSocket Exit ***")
    getETHProvider()
  })
  provider.on("ready", (e) => {
    //console.log('*** WebSocket Ready ***')
  })
  return provider
}

var web3 = new Web3(getETHProvider())
const ethInstance: ethContractInstance = {

  wethDai : new web3.eth.Contract(diamondProxyABI,
    wethDaiAddress
  ),
  wbtcDai : new web3.eth.Contract(diamondProxyABI,
    wbtcDaiAddress
  ),
  linkDai : new web3.eth.Contract(diamondProxyABI,
    linkDaiAddress
  ),
}


function start() {
  startExercise(ethInstance);
  startDeposit(ethInstance);
  startPurchase(ethInstance);
  startWithdrawal(ethInstance);
};


start();