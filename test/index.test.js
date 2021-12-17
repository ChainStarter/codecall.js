const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const {call, addChain, setDefaultChainId, getConfig, getCurrentChainId, getContractBytesCode} = require('../src/index')
const {ChainId} = require("../src/const");
const {compile, decodeData} = require("../src");

let caller, CallerArtifact;
let chainId = 31337;

/**
 * deploy caller contract
 * @returns {Promise<Contract>}
 */
const deployCaller =async () => {
  const CallerContract = await ethers.getContractFactory("Caller");
  const caller = await CallerContract.deploy();
  CallerArtifact = await hre.artifacts.readArtifact("Caller")
  await caller.deployed();
  return caller
}

describe("caller", function () {
  before(async function() {
    // deploy caller contract
    caller = await deployCaller()
  });

  it("add chain config", async function () {
    const address = caller.address
    // add hardhat chain
    addChain(chainId,
      {
        address,
        rpc: hre.network.provider
      })
    const config = getConfig()
    expect(config[chainId]).to.deep.equal({
      address,
      rpc: hre.network.provider
    })
  })

  it("set chainId", async function () {
    // set default chain
    setDefaultChainId(ChainId.BSC)

    const _chainId = getCurrentChainId()
    expect(_chainId).to.equal(ChainId.BSC)
  })

  it("set chainId not exist", async function () {
    // set default chain
    expect(() => setDefaultChainId(12345)).to.throw("can't find config by chainId 12345")
  })

  it("compile code", async function () {
    // set default chain
    const code = `
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `

    expect(() => compile(code)).to.not.throw()
      .to.be.instanceof(Object)
  })

  it("compile code witch syntax error", async function () {
    // set default chain
    const code = `
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;testcodeerr
                b = 1000;
            }
        }
    `
    expect(() => compile(code)).to.throw()
  })

  it("compile code without Request contract", async function () {
    // set default chain
    const code = `
        contract RequestOther {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `
    expect(() => compile(code)).to.throw("Contracts must be include Request contract!")
  })

  it("generate bytesCode", async function () {
    // set default chain
    const code = `
        contract Request {
            function exec() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `
    expect(() => getContractBytesCode(code)).to.not.throw()
  })


  it("get caller contract object without exec function", async function () {
    // set default chain
    const code = `
        contract Request {
            function other() public returns (uint a, uint b){
                a = 10;
                b = 1000;
            }
        }
    `
    expect(() => getContractBytesCode(code)).to.throw("Contracts must be contain exec function!")
  })

  it("decode data from caller data", async function () {
    const data = '0x000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000003e8'
    const abi = [
      { internalType: 'uint256', name: 'a', type: 'uint256' },
      { internalType: 'uint256', name: 'b', type: 'uint256' }
    ]

    expect(() => decodeData(data, abi)).to.not.throw().to.deep.equal({
      a: '10',
      b: '1000'
    })
  })

  it("decode data from caller data witch is error", async function () {
    const data = '0x'
    const abi = [
      { internalType: 'uint256', name: 'a', type: 'uint256' },
      { internalType: 'uint256', name: 'b', type: 'uint256' }
    ]

    expect(() => decodeData(data, abi)).to.throw()
  })

  it("call", async function () {
    const address = caller.address
    // add hardhat chain
    addChain(chainId,
      {
        address,
        rpc: hre.network.provider
      })

    // set default chain
    setDefaultChainId(chainId)

    // call data
    const data = await call(`
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