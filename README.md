# NFT Liquidity Mining with Ocean🦑

***
## 【Introduction of the NFT Liquidity Mining with Ocean🦑】
- This is a smart contract for ...

&nbsp;

***

## 【Workflow】

&nbsp;

***

## 【Remarks】
- Version
  - Solidity (Solc): v0.5.7
  - openzeppelin-solidity: v2.5.0

&nbsp;

***

## 【Setup】
### ① Install modules
```
$ npm install
```

<br>

### ② Compile & migrate contracts (on Rinkeby testnet)
```
$ npm run migrate:rinkeby
```

<br>

### ③ Execute script (it's instead of testing)
```
$ npm run script:rinkeby
```

<br>

### ④ Test (Mainnet-fork approach)
- 1. Start ganache-cli with mainnet-fork
```
$ ganache-cli --fork https://mainnet.infura.io/v3/{YOUR INFURA KEY}
```

&nbsp;

- 2. Execute each test file (on the local)
```
$ truffle test ./test/test-local/OceanFarmingToken.test.js

$ truffle test ./test/test-local/OceanGovernanceToken.test.js

$ truffle test ./test/test-local/OceanFarmingPool.test.js
```




***

## 【References】
- Ocean🦑Data Economic Challenge 2020
  - Guide：https://oceandec.devpost.com/details/hackerguide
