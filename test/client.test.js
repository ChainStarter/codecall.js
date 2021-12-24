const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const Client = require('../src/client')
const {ChainId} = require("../src/const");

const HECO_ADDRESS = '0xBF4b1bE1F00F5624ba4D65f8548ccF6E75d0deFe'
const HECO_RPC = "https://http-mainnet.hecochain.com"
const HECO_CHAINID = 128

describe("caller", function () {
  it("add chain config", async function () {
    const client = new Client('./src/worker.js')
    await client.addChain(HECO_CHAINID,
      {
        address: HECO_ADDRESS,
        rpc: HECO_RPC
      })
    const config = await client.getConfig()
    expect(config[128]).to.deep.equal({
      address: HECO_ADDRESS,
      rpc: HECO_RPC
    })
  })

  it("set chainId", async function () {
    const client = new Client('./src/worker.js')
    // set default chain
    await client.setDefaultChainId(ChainId.BSC)

    const _chainId = await client.getCurrentChainId()
    expect(_chainId).to.equal(ChainId.BSC)
  })
  //
  //
  // it("set chainId not exist", async function () {
  //   const client = new Client('./src/worker.js')
  //   await expect(client.setDefaultChainId(12345)).to.be.throw("can't find config by chainId 12345")
  // })

  it("compile code", async function () {
    const client = new Client('./src/worker.js')
    // set default chain
    const code = `
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `
    expect(() => client.compile(code)).to.not.throw()
      .to.be.instanceof(Object)
  })

  // it("compile code witch syntax error", async function () {
  //   // set default chain
  //   const code = `
  //       contract Request {
  //           function exec() public returns (uint a, uint b){
  //               a = 10;testcodeerr
  //               b = 1000;
  //           }
  //       }
  //   `
  //   expect(() => compile(code)).to.throw()
  // })

  // it("compile code without Request contract", async function () {
  //   // set default chain
  //   const code = `
  //       contract RequestOther {
  //           function exec() public returns (uint a, uint b){
  //               a = 10;
  //               b = 1000;
  //           }
  //       }
  //   `
  //   expect(() => compile(code)).to.throw("Contracts must be include Request contract!")
  // })

  it("generate bytesCode", async function () {
    const client = new Client('./src/worker.js')
    // set default chain
    const code = `
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `
    expect(() => client.getContractBytesCode(code)).to.not.throw()
  })
  //
  //
  // it("get caller contract object without exec function", async function () {
  //   // set default chain
  //   const code = `
  //       contract Request {
  //           function other() public returns (uint a, uint b){
  //               a = 10;
  //               b = 1000;
  //           }
  //       }
  //   `
  //   expect(() => getContractBytesCode(code)).to.throw("Contracts must be contain exec function!")
  // })
  //
  it("decode data from caller data", async function () {
    const client = new Client('./src/worker.js')
    const data = '0x000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000003e8'
    const abi = [
      { internalType: 'uint256', name: 'a', type: 'uint256' },
      { internalType: 'uint256', name: 'b', type: 'uint256' }
    ]

    expect(() => client.decodeData(data, abi)).to.not.throw().to.deep.equal({
      a: '10',
      b: '1000'
    })
  })

  // it("decode data from caller data witch is error", async function () {
  //   const data = '0x'
  //   const abi = [
  //     { internalType: 'uint256', name: 'a', type: 'uint256' },
  //     { internalType: 'uint256', name: 'b', type: 'uint256' }
  //   ]
  //
  //   expect(() => decodeData(data, abi)).to.throw()
  // })
  //

  it("call", async function () {
    const client = new Client('./src/worker.js')
    // call data
    const data = await client.call(`
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `)

    // expect
    expect(data).to.deep.equal({
      a: '10',
      b: '1000'
    })
  });
});