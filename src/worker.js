// importScripts("https://solc-bin.ethereum.org/wasm/soljson-v0.7.4+commit.3f05b770.js")

import core from './core/web'

const {
  getConfig,
  getCurrentChainId,
  call,
  addChain,
  setDefaultChainId,
  compile,
  getContractBytesCode,
  decodeData } = core

const response = (requestId, data = "", error = false, errorMsg = '') => {
  self.postMessage({
    requestId,
    data,
    error,
    errorMsg
  })
}

const responseError = (requestId, message) => {
  response(requestId, "", true, message)
}

self.onmessage = (ev) => {
  const {requestId, method, data} = ev.data
  switch (method) {
    case 'call':
      call(...data).then(_data => {
        response(requestId, _data)
      }).catch((e) => {
        responseError(requestId, e)
      })
      break;
    case "getConfig":
      try {
        response(requestId, getConfig())
      }catch (e){
        responseError(requestId, e)
      }

      break;
    case "getCurrentChainId":
      try {
        response(requestId, getCurrentChainId())
      }catch (e){
        responseError(requestId, e)
      }
      break;
    case "addChain":
      try{
        addChain(...data)
        response(requestId)
      }catch (e){
        responseError(requestId, e)
      }
      break;
    case "setDefaultChainId":
      try{
        setDefaultChainId(...data)
        response(requestId)
      }catch (e){
        responseError(requestId, e)
      }
      break;
    case "compile":
      try{
        compile(...data)
        response(requestId)
      }catch (e){
        responseError(requestId, e)
      }
      break;
    case "getContractBytesCode":
      try{
        response(requestId, getContractBytesCode(...data))
      }catch (e){
        responseError(requestId, e)
      }
      break;
    case "decodeData":
      try{
        response(requestId, decodeData(...data))
      }catch (e){
        responseError(requestId, e)
      }
      break;
  }
}