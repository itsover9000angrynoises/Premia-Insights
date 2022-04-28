var Web3 = require("web3");
import { alcxDaiAddress, alethAlusdAddress, diamondProxyABI, envConfig, linkDaiAddress, linkDaiAddressArbi, lunadaiAddress, wbtcDaiAddress, wbtcDaiAddressArbi, wbtcUsdcAddressFtm, wethDaiAddress, wethDaiAddressArbi, wethUsdcAddressFtm, wftmUsdcAddressFtm, yfidaiAddress, yfidaiAddressArbi, yfiUsdcAddressFtm } from './config/env';
import { getAlcxPrice, getDAIPrice, getEthPrice, getFtmPrice, getLinkPrice, getLunaPrice, getUsdcPrice, getWbtcPrice, getYfiPrice } from './core/chainlink-price';
import Pool from './core/Pool';
import { arbiContractInstance, ethContractInstance, ftmContractInstance } from './models/models';
import { arbiMainnet, bnToNumber, bnToNumberBTC, bnToNumberSix, ethMainnet, ftmMainnet } from './utils/utils';


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

var getFtmProvider = () => {
  const provider = new Web3.providers.WebsocketProvider(envConfig.ftmWSSEndpoint, {
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
    getFtmProvider()
  })
  provider.on("end", (e) => {
    console.log("*** WebSocket Ended ***")
    getFtmProvider()
  })
  provider.on("close", (e) => {
    console.log("*** WebSocket Closed ***")
    getFtmProvider()
  })
  provider.on("timeout", (e) => {
    console.log("*** WebSocket Timeout ***")
    getFtmProvider()
  })
  provider.on("exit", (e) => {
    console.log("*** WebSocket Exit ***")
    getFtmProvider()
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
  lunaDai: new web3.eth.Contract(diamondProxyABI,
    lunadaiAddress
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

var web3Ftm = new Web3(getFtmProvider())
const ftmInstance: ftmContractInstance = {

  wethUsdc: new web3Ftm.eth.Contract(diamondProxyABI,
    wethUsdcAddressFtm
  ),
  wbtcUsdc: new web3Ftm.eth.Contract(diamondProxyABI,
    wbtcUsdcAddressFtm
  ),
  wftmUsdc: new web3Ftm.eth.Contract(diamondProxyABI,
    wftmUsdcAddressFtm
  ),
  yfiUsdc: new web3Ftm.eth.Contract(diamondProxyABI,
    yfiUsdcAddressFtm
  ),
}

function start() {
  const wbtcdaieth = new Pool(
    "WBTC/DAI",
    ethInstance.wbtcDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getWbtcPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumberBTC, putAsset: bnToNumber, contract: bnToNumberBTC }
  );
  wbtcdaieth.start();
  console.log(`----------Started Listing to WBTC/DAI ${ethMainnet}`);

  const wbtcdaiarbi = new Pool(
    "WBTC/DAI",
    arbiInstance.wbtcDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getWbtcPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumberBTC, putAsset: bnToNumber, contract: bnToNumberBTC }
  );
  wbtcdaiarbi.start();
  console.log(`----------Started Listing to WBTC/DAI ${arbiMainnet}`);

  const wbtcusdcftm = new Pool(
    "WBTC/USDC",
    ftmInstance.wbtcUsdc,
    ftmMainnet,
    envConfig.startBlockHeightFtm,
    { callPrice: getWbtcPrice, putPrice: getUsdcPrice },
    { callAsset: bnToNumberBTC, putAsset: bnToNumberSix, contract: bnToNumberBTC }
  );
  wbtcusdcftm.start();
  console.log(`----------Started Listing to WBTC/USDC ${ftmMainnet}`);

  const wethdaieth = new Pool(
    "WETH/DAI",
    ethInstance.wethDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getEthPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  wethdaieth.start();
  console.log(`----------Started Listing to WETH/DAI ${ethMainnet}`);

  const wethdaiarbi = new Pool(
    "WETH/DAI",
    arbiInstance.wethDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getEthPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  wethdaiarbi.start();
  console.log(`----------Started Listing to WETH/DAI ${arbiMainnet}`);

  const wethusdcftm = new Pool(
    "WETH/USDC",
    ftmInstance.wethUsdc,
    ftmMainnet,
    envConfig.startBlockHeightFtm,
    { callPrice: getEthPrice, putPrice: getUsdcPrice },
    { callAsset: bnToNumber, putAsset: bnToNumberSix, contract: bnToNumber },
  );
  wethusdcftm.start();
  console.log(`----------Started Listing to WETH/USDC ${ftmMainnet}`);

  const linkdaieth = new Pool(
    "Link/DAI",
    ethInstance.linkDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getLinkPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  linkdaieth.start();
  console.log(`----------Started Listing to Link/DAI ${ethMainnet}`);

  const linkdaiarbi = new Pool(
    "Link/DAI",
    arbiInstance.linkDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getLinkPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  linkdaiarbi.start();
  console.log(`----------Started Listing to Link/DAI ${arbiMainnet}`);

  const alcxdaieth = new Pool(
    "Alcx/DAI",
    ethInstance.alcxDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getAlcxPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  alcxdaieth.start();
  console.log(`----------Started Listing to Alcx/DAI ${ethMainnet}`);

  const alethalusdeth = new Pool(
    "AlETH/AlUSD",
    ethInstance.alethAlusd,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getEthPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  alethalusdeth.start();
  console.log(`----------Started Listing to AlETH/AlUSD ${ethMainnet}`);

  const yfidaieth = new Pool(
    "YFI/DAI",
    ethInstance.yfiDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getYfiPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber, contract: bnToNumber },
  );
  yfidaieth.start();
  console.log(`----------Started Listing to YFI/DAI ${ethMainnet}`);

  const yfidaiarbi = new Pool(
    "YFI/DAI",
    arbiInstance.yfiDai,
    arbiMainnet,
    envConfig.startBlocKHeightArbi,
    { callPrice: getYfiPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber , contract: bnToNumber},
  );
  yfidaiarbi.start();
  console.log(`----------Started Listing to YFI/DAI ${arbiMainnet}`);

  const yfiusdcftm = new Pool(
    "YFI/USDC",
    ftmInstance.yfiUsdc,
    ftmMainnet,
    envConfig.startBlockHeightFtm,
    { callPrice: getYfiPrice, putPrice: getUsdcPrice },
    { callAsset: bnToNumber, putAsset: bnToNumberSix , contract: bnToNumber},
  );
  yfiusdcftm.start();
  console.log(`----------Started Listing to YFI/USDC ${ftmMainnet}`);

  const lunadaieth = new Pool(
    "LUNA/DAI",
    ethInstance.lunaDai,
    ethMainnet,
    envConfig.startBlocKHeightEth,
    { callPrice: getLunaPrice, putPrice: getDAIPrice },
    { callAsset: bnToNumber, putAsset: bnToNumber , contract: bnToNumber},
  );
  lunadaieth.start();
  console.log(`----------Started Listing to LUNA/DAI ${ethMainnet}`);

  const wftmusdcftm = new Pool(
    "WFTM/USDC",
    ftmInstance.wftmUsdc,
    ftmMainnet,
    envConfig.startBlockHeightFtm,
    { callPrice: getFtmPrice, putPrice: getUsdcPrice },
    { callAsset: bnToNumber, putAsset: bnToNumberSix , contract: bnToNumber},
  );
  wftmusdcftm.start();
  console.log(`----------Started Listing to WFTM/USDC ${ftmMainnet}`);

};


start();