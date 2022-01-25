import wrapper from 'solc/wrapper';
import libs from './libs'

importScripts("https://solc-bin.ethereum.org/wasm/soljson-v0.7.4+commit.3f05b770.js")
libs.setSolc(wrapper(Module))

const setVersion = (v = 'v0.7.4+commit.3f05b770') => {
  return new Promise((resolve, reject) => {
    try {
      importScripts(`https://solc-bin.ethereum.org/wasm/soljson-${v}.js`)
      libs.setSolc(wrapper(Module))
    }catch (e) {
      reject(e)
    }
  })
}

export default {
  ...libs,
  setVersion,
}

