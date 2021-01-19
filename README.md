# Ocean DataToken Yield Farming

***
## 【Introduction of the NFT Liquidity Mining with Ocean】
- This is a smart contract for ocean's data-token yield farming by using liquidity mining approach.

&nbsp;

***

## 【Workflow】
- ① Create a Balancer-Pool between Ocean and DataToken. (Add Liquidity)
- ② Receive `BPTs=Balance Pool Tokens (Ocean-DataToken)` and the `Ocean LP Tokens (OLP)` when add liquidity into a Balancer-Pool (Ocean-DataToken).
  - `Ocean LP Tokens (OLP)` represents `BPTs=Balance Pool Tokens (Ocean-DataToken)` when an user stake (Step③).
  - Received-Ocean LP Tokens (OLP) amount is same amount with received-BPTs amount.
- ③ Stake `Ocean LP Tokens (OLP)` into the `Ocean Farming Pool` contract.
- ④ Smart contract (the Ocean Farming Pool contract) automatically generate rewards per block.
  - The `Ocean Governance Token (OGC)` is generated as rewards.  
  - Staker can receive rewards ( `Ocean Governance Token (OGC)` ) depends on their share of pool and staked-period (blocks) when they claim rewards.
- ⑤ Claim rewards and distributes rewards into claimed-staker. (or, Un-Stake BPTs (Ocean-DataToken). At that time, claiming rewards will be executed at the same time)

&nbsp;

## 【Diagram】Ocean DataToken Yield Farming
![【Diagram】Ocean DataToken Yield Farming](https://user-images.githubusercontent.com/19357502/105047881-3da58880-5aae-11eb-854a-460f5efef1ac.jpg)

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

## 【Remaining tasks and next steps】
- Additional implementation of the Ocean Governance Token (OGC) and governance structures (e.g. Community voting function by OGC token holders)
- Add liquidity pool (balancer pool) for the Ocean Governance Token (OGC).
- Implement the front-end (UI).


&nbsp;


***

## 【References】
- Ocean Protocol  
  - Ocean V3 smart contract  
https://github.com/oceanprotocol/contracts  
  - Ocean V3 Document
    - Data Token: https://docs.oceanprotocol.com/concepts/introduction/  
  - dApp (Ocean Market)： https://market.oceanprotocol.com/  
  - Website (Earn): https://oceanprotocol.com/earn  
  - Ocean Data Economic Challenge 2020
    - Guide：https://oceandec.devpost.com/details/hackerguide  

<br>

- Balancer
  - BPT (Balancer Pool Token): https://docs.balancer.finance/core-concepts/protocol/pool-lifecycle#bpts  
  - BAT (Balance Governance Token): https://docs.balancer.finance/core-concepts/bal-balancer-governance-token  
  - Interfaces: https://docs.balancer.finance/smart-contracts/interfaces  

<br>

- SushiSwap contract: https://github.com/sushiswap/sushiswap  
- Benchmark protocol contract: https://github.com/benchmarkprotocol  

<br>

- Truffle test
  - Mainnet-fork approach with Ganache-CLI and Infura   
https://medium.com/@samajammin/how-to-interact-with-ethereums-mainnet-in-a-development-environment-with-ganache-3d8649df0876    
(Current block number @ mainnet: https://etherscan.io/blocks )    
