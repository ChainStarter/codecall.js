# Codecall.js

Codecall.js can compile the solidity code in the js project, execute it remotely on the node and return the result.

This can help us reduce the number of RPC requests. In addition to providing a parallel request function similar to Multicall, it also supports serial calls.

This project contains smart contract and client.

### Codecall Contract Addresses
| Chain   | Address |
|---------| ------- |
| BSC     | [0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe](https://bscscan.com/address/0xbf4b1be1f00f5624ba4d65f8548ccf6e75d0defe) |
| Polygon | [0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe](https://polygonscan.com/address/0xbf4b1be1f00f5624ba4d65f8548ccf6e75d0defe)
| HECO    | [0x6427169aB7344F9C37E9dC9001c681BEcd09343d](https://hecoinfo.com/address/0x6427169aB7344F9C37E9dC9001c681BEcd09343d)

## Summary

- Write local solidity and compile into bytecode
- Through RPC, send bytecode to the Caller contract and execute it
- Get the data returned by the execution and decode it

## Installation

```bash
yarn add @ChainStarter/codecall.js
```


## Usage

```javascript
import { call } from '@ChainStarter/codecall.js';

const code = `
        contract Request {
            function exec() public returns (uint a, uint b, uint c){
                a = 10;
                b = 1000;
                c = a + b;
            }
        }
    `
// call and get data
call(code).then(data => {
  console.log(data); // output {a: '10', b: '1000', c: '1100'}
})
```


## Other Functions
### Add custom chain
```javascript
import { addChain } from '@ChainStarter/codecall.js';

addChain(4399,
  {
    address: '0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe', // You can publish the contract on other chains by yourself
    rpc: "{{RPC}}" // The node rpc address
  })
```

### Set default chain
```javascript
import { setDefaultChainId } from '@ChainStarter/codecall.js';

// set default chain
setDefaultChainId(4399)
```
