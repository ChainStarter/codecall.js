export const ChainId = {
  BSC: 56,
  HECO: 128,
  POLYGON: 137,
}

export const Config = {
  [ChainId.BSC]: {
    rpc: "https://bsc-dataseed.binance.org",
    address: "0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe"
  },
  [ChainId.HECO]: {
    rpc: "https://http-mainnet.hecochain.com",
    address: "0x6427169aB7344F9C37E9dC9001c681BEcd09343d"
  },
  [ChainId.POLYGON]: {
    rpc: "https://polygon-rpc.com",
    address: "0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe"
  },
}
