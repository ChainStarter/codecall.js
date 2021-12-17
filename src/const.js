const ChainId = {
  BSC: 56,
  POLYGON: 137,
}

const Config = {
  [ChainId.BSC]: {
    rpc: "https://bsc-dataseed.binance.org",
    address: "0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe"
  },
  [ChainId.POLYGON]: {
    rpc: "https://polygon-rpc.com",
    address: "0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe"
  },
}

module.exports = {
  ChainId,
  Config
}
