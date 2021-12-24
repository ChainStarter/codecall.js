const {Worker} = require("worker_threads");
const {modules} = require("web3");
const isNode = (typeof exports === 'object') ? true: false;
let requestId = 0
let requestList = []

const processRequest = (requestId, data, error, errorMsg) => {
  const index = requestList.findIndex(o => o.requestId === requestId)
  if(index > -1){
    const {resolve, reject} = requestList[index]
    console.log(errorMsg)
    requestList.splice(index, 1)
    if(error){
      reject(errorMsg)
    }else{
      resolve(data)
    }

  }
}

const Client = function(path = './codecall.worker.js'){
  if(isNode){
    const { Worker} = require('worker_threads');
    this.worker = new Worker(path)
    this.worker.on('message', ({requestId, data, error, errorMsg}) => {
      processRequest(requestId, data, error, errorMsg)
    })
  }else{
    this.worker = new window.Worker(path)
    this.worker.onmessage = (evt) => {
       console.log(evt)
      // processRequest(evt,)
    }
  }
}

/**
 * send request
 * @param method
 * @param data
 * @returns {Promise<unknown>}
 */
Client.prototype.request = function(method, data = []) {
  return new Promise((resolve, reject) => {
    const _requestId = requestId++
    const onmessage = (evt) => {
      if(evt.requestId === _requestId){
        resolve(data)
      }
    }

    requestList.push({
      requestId: _requestId,
      method,
      data,
      resolve,
      reject
    })

    this.worker.postMessage({
      requestId: _requestId,
      method,
      data
    })
  })
}

/**
 * send request to caller contract with solidity code
 * @param code
 * @param _chainId
 * @returns {Promise<{}>}
 */
Client.prototype.call = function(code, chainId = 56) {
  return this.request('call', [code, chainId])
}
/**
 * get current config
 * @returns {Promise<{"[ChainId.POLYGON]": {address: string, rpc: string}}>}
 */
Client.prototype.getConfig = function() {
  return this.request('getConfig')
}
/**
 * get current chain id
 * @returns {Promise<number>}
 */
Client.prototype.getCurrentChainId = async function() {
  return this.request('getCurrentChainId')
}

/**
 * add chain config
 * @param _chainId chain id
 * @param _config  config contains rpc and caller contract address
 */
Client.prototype.addChain = function(chainId, config) {
  return this.request('addChain', [chainId, config])
}
/**
 * set default chainId
 * @param _chainId
 * @returns {Promise<?>}
 */
Client.prototype.setDefaultChainId = function(chainId) {
  return this.request('setDefaultChainId', [chainId])
}
/**
 * compile contract , only support 0.7.3
 * @param code solidity code
 * @returns {Promise<?>} contract The contract object
 */
Client.prototype.compile = function(code) {
  return this.request('compile', [code])
}
/**
 * generate bytesCode by solidity code
 * @param code
 * @returns {Promise<?>}
 */
Client.prototype.getContractBytesCode = function(code) {
  return this.request('getContractBytesCode', [code])
}
/**
 * get caller contract object
 * @param _config
 * @returns {Promise<?>}
 */
Client.prototype.getCallContract = function(config) {
  return this.request('getCallContract', [config])
}
/**
 * decode return data with abi
 * @param data
 * @param abi
 * @returns {{}}
 */
Client.prototype.decodeData = function(data, abi) {
  return this.request('decodeData', [data, abi])
}

module.exports = Client