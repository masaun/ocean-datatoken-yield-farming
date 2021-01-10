/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Test module for time-related things
const { expectRevert, time } = require('@openzeppelin/test-helpers');

/// Balancer（BPool and BToken）
const Decimal = require('decimal.js')
const { assert } = require('chai')
const BPool = artifacts.require('BPool')
const BFactory = artifacts.require('BFactory')
const TToken = artifacts.require('DataTokenTemplate')
const swapFee = 10 ** -3 // 0.001;

let WETH; let DAI // addresses
let weth; let dai // TTokens
let factory       // BPool factory
let pool          // first pool w/ defaults
let POOL          // Pool address

/// Artifact of each contracts
const OceanFarmingPool = artifacts.require("OceanFarmingPool");
const OceanLPToken = artifacts.require("OceanLPToken");
const OceanFarmingToken = artifacts.require("OceanFarmingToken");
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

/// GloBPT variable
let oceanFarmingPool;
let oceanLPToken;
let oceanFarmingToken;
let oceanGovernanceToken;

/// Deployed address
let OCEAN_FARMING_POOL;
let OCEAN_LP_TOKEN;
let OCEAN_FARMING_TOKEN;
let OCEAN_GOVERNANCE_TOKEN;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/OceanFarmingPool.test.js
 **/
contract("OceanFarmingPool", function(accounts) {

    const deployer = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];


    describe("Setup OceanFarmingPool", () => {
        it("Check all accounts", async () => {
            console.log('\n=== accounts ===\n', accounts);
        });        

        it("Setup OceanFarmingToken contract instance", async () => {
            oceanFarmingToken = await OceanFarmingToken.new({ from: accounts[0] });
            OCEAN_FARMING_TOKEN = oceanFarmingToken.address;
        });

        it("Setup OceanLPToken contract instance", async () => {
            oceanLPToken = await OceanLPToken.new({ from: accounts[0] });
            OCEAN_LP_TOKEN = oceanLPToken.address;
        });

        it("Setup OceanGovernanceToken contract instance", async () => {
            oceanGovernanceToken = await OceanGovernanceToken.new({ from: accounts[0] });
            OCEAN_GOVERNANCE_TOKEN = oceanGovernanceToken.address;
        });

        it("Setup OceanFarmingPool contract instance", async () => {
            /// [Note]: 100 per block farming rate starting at block 100 until block 1000
            const _oceanFarmingToken = oceanFarmingToken.address;
            const _oceanGovernanceToken = oceanGovernanceToken.address;
            const _oceanGovernanceTokenPerBlock = 100;
            const _startBlock = 100;
            const _endBlock = 1000;

            oceanFarmingPool = await OceanFarmingPool.new(_oceanFarmingToken, 
                                                          _oceanGovernanceToken, 
                                                          _oceanGovernanceTokenPerBlock, 
                                                          _startBlock, 
                                                          _endBlock, 
                                                          { from: accounts[0] });

            OCEAN_FARMING_POOL = oceanFarmingPool.address;
        });
    });


    /***
     * @dev - Reference from /Balancer/BPool.Test.js
     **/
    describe("Setup BPool and BToken", () => {
        const { toWei } = web3.utils
        const { fromWei } = web3.utils
        const admin = accounts[0]

        const MAX = web3.utils.toTwosComplement(-1)  /// [Result]: 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

        // let WETH; let DAI // addresses
        // let weth; let dai // TTokens
        // let factory // BPool factory
        // let pool // first pool w/ defaults
        // let POOL //   pool address

        const wethBalance = '4'
        const wethDenorm = '10'

        let currentWethBalance = Decimal(wethBalance)
        let previousWethBalance = currentWethBalance

        const daiBalance = '12'
        const daiDenorm = '10'

        let currentDaiBalance = Decimal(daiBalance)
        let previousDaiBalance = currentDaiBalance

        let currentPoolBalance = Decimal(0)
        let previousPoolBalance = Decimal(0)

        const sumWeights = Decimal(wethDenorm).add(Decimal(daiDenorm))
        const wethNorm = Decimal(wethDenorm).div(Decimal(sumWeights))
        const daiNorm = Decimal(daiDenorm).div(Decimal(sumWeights))

        it("Create contract instances of BPool and BToken", async () => {
            const poolTemplate = await BPool.new()
            factory = await BFactory.new(poolTemplate.address)
            POOL = await factory.newBPool.call() // this works fine in clean room
            console.log('\n=== POOL (factory.newBPool()) ===',POOL);

            await factory.newBPool({ from: admin })
            pool = await BPool.at(POOL)

            const blob = 'https://example.com/dataset-1'
            const communityFeeCollector = '0xeE9300b7961e0a01d9f0adb863C7A227A07AaD75'
            weth = await TToken.new('Wrapped Ether', 'WETH', admin, MAX, blob, communityFeeCollector)
            dai = await TToken.new('Dai Stablecoin', 'DAI', admin, MAX, blob, communityFeeCollector)

            WETH = weth.address
            DAI = dai.address

            await weth.mint(admin, MAX)
            await dai.mint(admin, MAX)

            await weth.approve(pool.address, MAX, { from: admin })
            await dai.approve(pool.address, MAX, { from: admin })

            await pool.setup(
                WETH,
                toWei(wethBalance),
                toWei(wethDenorm),
                DAI,
                toWei(daiBalance),
                toWei(daiDenorm),
                toWei(String(swapFee))
            )

            assert.equal(
                await pool.isFinalized(),
                true
            )

            /// [Note]: The Ocean Liquidity Provider (LP) Tokens that represents a BPT (Balancer Pool Token) of a pair between OCEAN and DataToken.
            /// Mint the Ocean LP tokens which is same amount of BPT.
            let _poolBalance = await pool.balanceOf(admin, { from: admin }); 
            let poolBalance = parseFloat(web3.utils.fromWei(_poolBalance));
            await oceanLPToken.mint(admin, web3.utils.toWei(`${ poolBalance }`, 'ether'));
        })

        it('joinPool (Add liquidity) into the Balancer Pool', async () => {
            const addLiquidityAmount = '1'
            await pool.joinPool(toWei(addLiquidityAmount), [MAX, MAX])

            /// [Note]: The Ocean Liquidity Provider (LP) Tokens that represents a BPT (Balancer Pool Token) of a pair between OCEAN and DataToken.
            /// Mint the Ocean LP tokens which is same amount of BPT.
            await oceanLPToken.mint(user1, web3.utils.toWei(addLiquidityAmount, 'ether'));
        })
    }); 

    describe("Transfer BPT & Ocean LP Token. Then, both of balance is checked", () => {
        it("Transfer BPT into admin (deployer)", async () => {
            let _BPTBalance = await pool.balanceOf(deployer, { from: deployer }); 
            let BPTBalance = parseFloat(web3.utils.fromWei(_BPTBalance));
            console.log('\n=== BPT Balance of deployer (admin) ===', BPTBalance);  /// [Result]: 101

            const amount = web3.utils.toWei('10', 'ether');
            await pool.transfer(user1, amount, { from: deployer });

            /// [Note]: The Ocean Liquidity Provider (LP) Tokens that represents a BPT (Balancer Pool Token) of a pair between OCEAN and DataToken.
            /// Transfer the Ocean LP tokens which is same amount of BPT.
            await oceanLPToken.transfer(user1, amount, { from: deployer });
        });

        it("BPT Balance of user1", async () => {
            let _BPTBalance = await pool.balanceOf(user1, { from: user1 }); 
            let BPTBalance = parseFloat(web3.utils.fromWei(_BPTBalance));
            console.log('\n=== BPT Balance of user1 ===', BPTBalance);  /// [Result]: 10
        });

        it("Ocean LP Token (OLP) Balance of user1", async () => {
            let _OLPBalance = await pool.balanceOf(user1, { from: user1 }); 
            let OLPBalance = parseFloat(web3.utils.fromWei(_OLPBalance));
            console.log('\n=== Ocean LP Token (OLP) Balance of user1 ===', OLPBalance);  /// [Result]: 
        });
    });

    // describe("Mint Ocean LP Token", () => {
    //     it('Mint Ocean LP Token (which is same amount with a BPT) into user1', async () => {
    //         /// [Note]: Ocean Liquidity Provider (LP) Token contract that represents a BPT (Balancer Pool Token) of a pair between OCEAN and DataToken. 
    //         const mintAmount = web3.utils.toWei('101', 'ether');  /// 101 OLP
    //         await oceanLPToken.mint(user1, mintAmount);
    //     })
    // });

    describe("Create Pool (Ocean-DataToken)", () => {
        it("Add pool data into the PoolInfo struct", async () => {
            /// [Todo]: 
            const _allocPoint = 1;
            const _lpToken = POOL;
            const _withUpdate = true;

            /// [Note]: The "add()" method should be executed by admin (deployer)
            await oceanFarmingPool.add(_allocPoint, _lpToken, _withUpdate, { from: deployer });
        });

        it("Check pool length of the PoolInfo structs", async () => {
            const _poolLength = await oceanFarmingPool.poolLength({ from: deployer });
            let poolLength = parseFloat(web3.utils.fromWei(_poolLength));
            //let poolLength = web3.utils.toWei(_poolLength);
            console.log('\n=== poolLength ===', poolLength);  /// [Result]: 1
        });      
    });

    describe("OceanFarmingPool", () => {
        it("Stake BToken into OceanFarmingPool", async () => {
            /// [Note]: BToken is inherited into BPool. Therefore, BToken address is same with BPool address. (1 BPool has 1 BToken)
            const poolId = 0;  /// [Note]: Index number of the PoolInfo struct
            const stakedBTokenAmount = web3.utils.toWei('5', 'ether');  /// 5 BPT
            
            await pool.approve(OCEAN_FARMING_POOL, stakedBTokenAmount, { from: user1 });
            await oceanLPToken.approve(OCEAN_FARMING_POOL, stakedBTokenAmount, { from: user1 });

            await oceanFarmingPool.stake(poolId, OCEAN_LP_TOKEN, stakedBTokenAmount, { from: user1 });
        });

        it("Check the Ocean Farming Token (OFG) Balance of user1 (after user1 staked)", async () => {
            let _oceanFarmingTokenBalance = await oceanFarmingToken.balanceOf(user1, { from: user1 }); 
            let oceanFarmingTokenBalance = parseFloat(web3.utils.fromWei(_oceanFarmingTokenBalance));
            console.log('\n=== Ocean Farming Token (OFG) Balance of user ===', oceanFarmingTokenBalance);  /// [Result]: 10

        });

        it("Un-Stake BToken from OceanFarmingPool and receive the Ocean Governance Token (OGC) as rewards", async () => {
            /// [Note]: BToken is inherited into BPool. Therefore, BToken address is same with BPool address. (1 BPool has 1 BToken)
            const poolId = 0;  /// [Note]: Index number of the PoolInfo struct
            const unStakedBTokenAmount = web3.utils.toWei('5', 'ether');  /// 5 BPT

            await pool.approve(OCEAN_FARMING_POOL, unStakedBTokenAmount, { from: user1 });
            await oceanLPToken.approve(OCEAN_FARMING_POOL, unStakedBTokenAmount, { from: user1 });
            
            await oceanFarmingPool.unStake(poolId, OCEAN_LP_TOKEN, unStakedBTokenAmount, { from: user1 });  /// [Result]: 
        });

        it("Check each token's balance of user1 finally (after user1 un-staked)", async () => {
            let _BPTBalance = await pool.balanceOf(user1, { from: user1 }); 
            let BPTBalance = parseFloat(web3.utils.fromWei(_BPTBalance));
            console.log('\n=== BPT Balance of user1 ===', BPTBalance);

            let _OLPBalance = await pool.balanceOf(user1, { from: user1 }); 
            let OLPBalance = parseFloat(web3.utils.fromWei(_OLPBalance));
            console.log('\n=== Ocean LP Token (OLP) Balance of user1 ===', OLPBalance);

            let _oceanFarmingTokenBalance = await oceanFarmingToken.balanceOf(user1, { from: user1 }); 
            let oceanFarmingTokenBalance = parseFloat(web3.utils.fromWei(_oceanFarmingTokenBalance));
            console.log('\n=== Ocean Farming Token (OFG) Balance of user ===', oceanFarmingTokenBalance);

            let _oceanGovernanceTokenBalance = await oceanGovernanceToken.balanceOf(user1, { from: user1 }); 
            let oceanGovernanceTokenBalance = parseFloat(web3.utils.fromWei(_oceanGovernanceTokenBalance));
            console.log('\n=== Ocean Governance Token (OGC) Balance of user ===', oceanGovernanceTokenBalance);
        });
    });

});
