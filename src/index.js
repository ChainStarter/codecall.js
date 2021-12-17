/**
 * 1. 编译sol代码，编译成字节码
 * 2. 发送请求，获取返回
 * @type {{}}
 */
const solc = require('solc');
const Web3 = require('web3');

const AbiCoder = require('web3-eth-abi');
const CallAbi = require('./abis/Caller.json')
const {ChainId, Config} = require("./const");

/**
 * define default params
 * @type {number}
 */
let chainId = ChainId.POLYGON
let config = Config

/**
 * add chain config
 * @param _chainId chain id
 * @param _config  config contains rpc and caller contract address
 */
const addChain = (_chainId, _config) => {
  if(typeof _config.rpc == 'undefined') {
    throw 'rpc can\'t be undefined'
  }

  if(typeof _config.address == 'undefined') {
    throw 'address can\'t be undefined'
  }

  Object.assign(config, {
    [_chainId]: _config
  })
}

/**
 * set default chainId
 * @param _chainId
 */
const setDefaultChainId = (_chainId) => {
  if(typeof config[_chainId] === 'undefined'){
    throw `can\'t find config by chainId ${_chainId}`
  }

  chainId = _chainId
}

/**
 * compile contract , only support 0.7.3
 * @param code solidity code
 * @returns contract The contract object
 */
const compile = (code) => {
  const input = {
    language: 'Solidity',
    sources: {
      'request': {
        content: `
        // SPDX-License-Identifier: GPL-3.0
        pragma solidity 0.7.3;
        ${code}
        `
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  const {errors, contracts}  = JSON.parse(solc.compile(JSON.stringify(input)));
  if(typeof errors != 'undefined'){
    const error = errors.find(o => o.severity === 'error')
    if(typeof error != 'undefined'){
      throw `Contracts compile error: ${error.formattedMessage}`
    }
  }

  const contract = contracts.request.Request
  if(typeof contract === 'undefined'){
    throw 'Contracts must be include Request contract!'
  }

  return contract
}

/**
 * generate bytesCode by solidity code
 * @param code
 * @returns {{bytesCode: string, outputAbi: array}}
 */
const getContractBytesCode= (code) => {
  const contract = compile(code)
  const bytesCode = `0x${contract.evm.bytecode.object}`
  const execAbi = contract.abi.find(o => o.name === 'exec')
  if(typeof  execAbi == 'undefined'){
    throw 'Contracts must be contain exec function!'
  }
  return {
    bytesCode,
    outputAbi: contract.abi.find(o => o.name === 'exec').outputs
  }
}

/**
 * get caller contract object
 * @param _config
 * @returns {Contract}
 */
const getCallContract = (_config) => {
  const web3 = new Web3(_config.rpc)
  const caller = new web3.eth.Contract(CallAbi, _config.address);
  return caller
}

/**
 * decode return data with abi
 * @param data
 * @param abi
 * @returns {{}}
 */
const decodeData = (data, abi) => {
  const decode = AbiCoder.decodeParameters(abi, data)
  const _data = {}
  abi.map(param => {
    Object.assign(_data,{
      [param.name]: decode[param.name]
    })
  })
  return _data
}

/**
 * send request to caller contract with solidity code
 * @param code
 * @param _chainId
 * @returns {Promise<{}>}
 */
const call = async (code, _chainId = chainId) => {
  const {bytesCode, outputAbi} = getContractBytesCode(code)

  const caller = getCallContract(config[_chainId])

  const data = await caller.methods.send(bytesCode, 1).call()

  const decode = decodeData(data, outputAbi)

  return decode
}

const getCurrentChainId = () => {
  return chainId
}

const getConfig = () => {
  return config
}

module.exports = {
  getConfig,
  getCurrentChainId,
  call,
  addChain,
  setDefaultChainId,
  compile,
  getContractBytesCode,
  getCallContract,
  decodeData
}