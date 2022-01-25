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

### Step1: Install SDK
```bash
yarn add @chainstarter/codecall.js
```

or 

```bash
 npm install --save @chainstarter/codecall.js
```

### Step2: Copy Worker to static folder

```javascript
// webpack CopyWebpackPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpackConfig = {
  plugins : [
      ...,
      new CopyWebpackPlugin([ // add plugin
        {
          from: 'node_modules/@chainstarter/codecall.js/dist/codecall.worker.js',
          to: 'codecall.worker.js'
        }
      ])
  ]
}


```

## Usage

### Web
```javascript
import {Client}  from '@chainstarter/codecall.js'
client = new Client()

const code = `
        contract Request {
            function exec() public returns (uint a, uint b, uint c){
                a = 10;
                b = 1000;
                c = a + b;
            }
        }
    `
// call and print data
client.call(code).then(console.log)
```

#### Add custom chain
```javascript
import { Client } from '@chainstarter/codecall.js';
client = new Client()
client.addChain(4399,
  {
    address: '0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe', // You can publish the contract on other chains by yourself
    rpc: "{{RPC}}" // The node rpc address
  })
```

#### Set default chain
```javascript
import { Client } from '@chainstarter/codecall.js';
client = new Client()
// set default chain
client.setDefaultChainId(4399)
```

### Nodejs
```javascript
const {call} = require('@chainstarter/codecall.js/dist/node')
// call data
call(`
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
`).then(console.log)

```
