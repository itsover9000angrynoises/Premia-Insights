var Web3 = require("web3");
import { alcxDaiAddress, alethAlusdAddress, diamondProxyABI, envConfig, linkDaiAddress, linkDaiAddressArbi, wbtcDaiAddress, wbtcDaiAddressArbi, wethDaiAddress, wethDaiAddressArbi, yfidaiAddress, yfidaiAddressArbi } from './config/env';
import { getAlcxPrice, getDAIPrice, getEthPrice, getLinkPrice, getWbtcPrice, getYfiPrice } from './core/chainlink-price';
import eightDecimalPool from './core/eightDecimalPool';
import eighteenDecimalPool from './core/eighteenDecimalPool';
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
  yfiDai: new web3.eth.Contract(diamondProxyABI,
    yfidaiAddress
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
  yfiDai: new web3Arbi.eth.Contract(diamondProxyABI,
    yfidaiAddressArbi
  ),
}

function start() {
  const wbtcdaieth = new eightDecimalPool(
    "WBTC/DAI",
    ethInstance.wbtcDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getWbtcPrice, putPrice: getDAIPrice }
  );
  wbtcdaieth.start();
  console.log(`----------Started Listing to WBTC/DAI ${ethMainnet}`);

  const wbtcdaiarbi = new eightDecimalPool(
    "WBTC/DAI",
    arbiInstance.wbtcDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getWbtcPrice, putPrice: getDAIPrice }
  );
  wbtcdaiarbi.start();
  console.log(`----------Started Listing to WBTC/DAI ${arbiMainnet}`);

  const wethdaieth = new eighteenDecimalPool(
    "WETH/DAI",
    ethInstance.wethDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getEthPrice, putPrice: getDAIPrice });
  wethdaieth.start();
  console.log(`----------Started Listing to WETH/DAI ${ethMainnet}`);

  const wethdaiarbi = new eighteenDecimalPool(
    "WETH/DAI",
    arbiInstance.wethDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getEthPrice, putPrice: getDAIPrice });
  wethdaiarbi.start();
  console.log(`----------Started Listing to WETH/DAI ${arbiMainnet}`);

  const linkdaieth = new eighteenDecimalPool(
    "Link/DAI",
    ethInstance.linkDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getLinkPrice, putPrice: getDAIPrice });
  linkdaieth.start();
  console.log(`----------Started Listing to Link/DAI ${ethMainnet}`);

  const linkdaiarbi = new eighteenDecimalPool(
    "Link/DAI",
    arbiInstance.linkDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getLinkPrice, putPrice: getDAIPrice });
  linkdaiarbi.start();
  console.log(`----------Started Listing to Link/DAI ${arbiMainnet}`);

  const alcxdaieth = new eighteenDecimalPool(
    "Alcx/DAI",
    ethInstance.alcxDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getAlcxPrice, putPrice: getDAIPrice });
  alcxdaieth.start();
  console.log(`----------Started Listing to Alcx/DAI ${ethMainnet}`);

  const alethalusdeth = new eighteenDecimalPool(
    "AlETH/AlUSD",
    ethInstance.alethAlusd,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getEthPrice, putPrice: getDAIPrice });
  alethalusdeth.start();
  console.log(`----------Started Listing to AlETH/AlUSD ${ethMainnet}`);

  const yfidaieth = new eighteenDecimalPool(
    "YFI/DAI",
    ethInstance.yfiDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getYfiPrice, putPrice: getDAIPrice });
  yfidaieth.start();
  console.log(`----------Started Listing to YFI/DAI ${ethMainnet}`);

  const yfidaiarbi = new eighteenDecimalPool(
    "YFI/DAI",
    arbiInstance.yfiDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getYfiPrice, putPrice: getDAIPrice });
  yfidaiarbi.start();
  console.log(`----------Started Listing to YFI/DAI ${arbiMainnet}`);

};


start();