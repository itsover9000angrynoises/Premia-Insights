var Web3 = require("web3");
import { alcxDaiAddress, alethAlusdAddress, diamondProxyABI, envConfig, linkDaiAddress, linkDaiAddressArbi, wbtcDaiAddress, wbtcDaiAddressArbi, wethDaiAddress, wethDaiAddressArbi } from './config/env';
import alcxdai from './core/alcxdai';
import alethalusd from './core/alethalusd';
import linkdai from './core/linkdai';
import wbtcdai from './core/wbtcdai';
import wethdai from './core/wethdai';
import { arbiContractInstance, ethContractInstance } from './models/models';
import { arbiMainnet, ethMainnet } from './utils/utils';


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

var getArbiProvider = () => {
  const provider = new Web3.providers.WebsocketProvider(envConfig.arbiWSSEndpoint, {
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
    getArbiProvider()
  })
  provider.on("end", (e) => {
    console.log("*** WebSocket Ended ***")
    getArbiProvider()
  })
  provider.on("close", (e) => {
    console.log("*** WebSocket Closed ***")
    getArbiProvider()
  })
  provider.on("timeout", (e) => {
    console.log("*** WebSocket Timeout ***")
    getArbiProvider()
  })
  provider.on("exit", (e) => {
    console.log("*** WebSocket Exit ***")
    getArbiProvider()
  })
  provider.on("ready", (e) => {
    //console.log('*** WebSocket Ready ***')
  })
  return provider
}

var web3 = new Web3(getETHProvider())
const ethInstance: ethContractInstance = {

  wethDai: new web3.eth.Contract(diamondProxyABI,
    wethDaiAddress
  ),
  wbtcDai: new web3.eth.Contract(diamondProxyABI,
    wbtcDaiAddress
  ),
  linkDai: new web3.eth.Contract(diamondProxyABI,
    linkDaiAddress
  ),
  alcxDai: new web3.eth.Contract(diamondProxyABI,
    alcxDaiAddress
  ),
  alethAlusd: new web3.eth.Contract(diamondProxyABI,
    alethAlusdAddress
  ),
}

var web3Arbi = new Web3(getArbiProvider())
const arbiInstance: arbiContractInstance = {

  wethDai: new web3Arbi.eth.Contract(diamondProxyABI,
    wethDaiAddressArbi
  ),
  wbtcDai: new web3Arbi.eth.Contract(diamondProxyABI,
    wbtcDaiAddressArbi
  ),
  linkDai: new web3Arbi.eth.Contract(diamondProxyABI,
    linkDaiAddressArbi
  ),
}

function start() {
  const wbtcdaieth = new wbtcdai(ethInstance.wbtcDai, ethMainnet, envConfig.startBlocKHeightEth);
  wbtcdaieth.start();
  console.log(`----------Started Listing to WBTC/DAI ${ethMainnet}`);
  const wbtcdaiarbi = new wbtcdai(arbiInstance.wbtcDai, arbiMainnet, envConfig.startBlocKHeightArbi);
  wbtcdaiarbi.start();
  console.log(`----------Started Listing to WBTC/DAI ${arbiMainnet}`);

  const wethdaieth = new wethdai(ethInstance.wethDai, ethMainnet, envConfig.startBlocKHeightEth);
  wethdaieth.start();
  console.log(`----------Started Listing to WETH/DAI ${ethMainnet}`);

  const wethdaiarbi = new wethdai(arbiInstance.wethDai, arbiMainnet, envConfig.startBlocKHeightArbi);
  wethdaiarbi.start();
  console.log(`----------Started Listing to WETH/DAI ${arbiMainnet}`);

  const linkdaieth = new linkdai(ethInstance.linkDai, ethMainnet, envConfig.startBlocKHeightEth);
  linkdaieth.start();
  console.log(`----------Started Listing to Link/DAI ${ethMainnet}`);

  const linkdaiarbi = new linkdai(arbiInstance.linkDai, arbiMainnet, envConfig.startBlocKHeightArbi);
  linkdaiarbi.start();
  console.log(`----------Started Listing to Link/DAI ${arbiMainnet}`);

  const alcxdaieth = new alcxdai(ethInstance.alcxDai, ethMainnet, envConfig.startBlocKHeightEth);
  alcxdaieth.start();
  console.log(`----------Started Listing to Alcx/DAI ${ethMainnet}`);

  const alethalusdeth = new alethalusd(ethInstance.alethAlusd, ethMainnet, envConfig.startBlocKHeightEth);
  alethalusdeth.start();
  console.log(`----------Started Listing to AlETH/AlUSD ${ethMainnet}`);

};


start();