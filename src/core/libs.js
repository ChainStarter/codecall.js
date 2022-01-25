import axios from 'axios';
import AbiCoder from 'web3-eth-abi';
import CallAbi from '../abis/Caller.json'
import {ChainId, Config} from "../const";

/**
 * define default params
 * @type {number}
 */
let chainId = ChainId.POLYGON
let config = Config
let solc = null

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

const setSolc = (_solc) => {
  solc = _solc
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
 * compile contract , only support 0.7.4
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
        pragma solidity >= 0.7.0;
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

  const requestData = AbiCoder.encodeFunctionCall(CallAbi[0], [bytesCode, 1])

  const _config = config[chainId]

  const ret = await axios.post(_config.rpc, {
    id: 1,
    jsonrpc:"2.0",
    method: "eth_call",
    params: [{
      to: _config.address,
      data: requestData,
    }, 'latest']
  })

  const {data:{result}} = ret
  const data = AbiCoder.decodeParameters(CallAbi[0].outputs, result)
  const decode = decodeData(data[0], outputAbi)
  return decode
}

/**
 * get current chain id
 * @returns {number}
 */
const getCurrentChainId = () => {
  return chainId
}

/**
 * get current config
 * @returns {{"[ChainId.POLYGON]": {address: string, rpc: string}}}
 */
const getConfig = () => {
  return config
}

export default {
  getConfig,
  setSolc,
  getCurrentChainId,
  call,
  addChain,
  setDefaultChainId,
  compile,
  getContractBytesCode,
  decodeData,
  ChainId,
  Config
}