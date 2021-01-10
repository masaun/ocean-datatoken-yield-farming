# Ocean DataToken Yield Farming

***
## 【Introduction of the NFT Liquidity Mining with Ocean】
- This is a smart contract for ocean's data-token yield farming by using liquidity mining approach.

&nbsp;

***

## 【Workflow】

&nbsp;

***

## 【Remarks】
- Version
  - Solidity (Solc): v0.5.7
  - openzeppelin-solidity: v2.4.0

&nbsp;

***

## 【Setup】
### ① Install modules
```
$ npm install
```

<br>

### ② Compile & migrate contracts (on local)
```
$ npm run migrate:local
```

<br>

### ③ Test (Mainnet-fork approach)
- 1: Start ganache-cli with mainnet-fork
```
$ ganache-cli --fork https://mainnet.infura.io/v3/{YOUR INFURA KEY}@{BLOCK_NUMBER}
```

<br>

- 2: Execute test of the balancer-related contract (on the local)
(BPool and BToken)
```
$ npm run test:balancer
($ truffle test ./test/test-local/ocean-v3/unit/balancer/*)
```

<br>

- 3: Execute test of the Ocean Farming Pool contract (on the local)
```
【Ocean Farming Pool】
$ npm run test
($ truffle test ./test/test-local/OceanFarmingToken.test.js)
($ truffle test ./test/test-local/OceanGovernanceToken.test.js)


$ npm run test:farming
($ truffle test ./test/test-local/OceanFarmingPool.test.js)
```

<br>


***

## 【References】
- Ocean Data Economic Challenge 2020
  - Guide：https://oceandec.devpost.com/details/hackerguide

<br>

- Truffle test (Mainnet-fork approach with Ganache-CLI and Infura)  
https://medium.com/@samajammin/how-to-interact-with-ethereums-mainnet-in-a-development-environment-with-ganache-3d8649df0876  
(Current block number @ mainnet: https://etherscan.io/blocks )  
