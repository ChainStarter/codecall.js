const {
  getConfig,
  getCurrentChainId,
  call,
  addChain,
  setDefaultChainId,
  compile,
  getContractBytesCode,
  getCallContract,
  decodeData} = require('./index')


const isNode = (typeof exports === 'object') ? true: false;

let context = this
if(isNode) {
  const {parentPort} = require("worker_threads");
  context = parentPort
}

const response = (requestId, data = "", error = false, errorMsg = '') => {
  context.postMessage({
    requestId,
    data,
    error,
    errorMsg
  })
}

const responseError = (requestId, message) => {
  response(requestId, "", true, message)
}

context.onmessage = (ev) => {
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
    case "getCallContract":
      try{
        response(requestId, getCallContract(...data))
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