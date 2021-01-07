/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

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
const OceanFarmingToken = artifacts.require("OceanFarmingToken");
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

/// Global variable
let oceanFarmingPool;
let oceanFarmingToken;
let oceanGovernanceToken;

/// Deployed address
let OCEAN_FARMING_POOL;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/OceanFarmingPool.test.js
 **/
contract("OceanFarmingPool", function(accounts) {

    const deployer = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    /***
     * @dev - Reference from /balancer/BPool.Test.js
     **/
    describe("Setup BPool and BToken", () => {
        const { toWei } = web3.utils
        const { fromWei } = web3.utils
        const admin = accounts[0]

        const MAX = web3.utils.toTwosComplement(-1)

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
        })
    }); 

    describe('BToken tests', () => {
        it('should get name, symbol, decimals', async () => {
            const bPool = await BPool.at(POOL, { from: deployer });
            const _name = await bPool.name({ from: deployer });
            const _symbol = await bPool.symbol({ from: deployer });
            const _decimals = await bPool.decimals({ from: deployer });

            // const name = web3.utils.fromWei(`${ _name }`);
            // const symbol = web3.utils.fromWei(`${ _symbol }`);
            // const decimals = web3.utils.fromWei(`${ _decimals }`);         
            console.log('\n=== name, symbol, decimals ===', _name, _symbol, _decimals);
        })
    })

    describe("Setup OceanFarmingPool", () => {
        it("Check all accounts", async () => {
            console.log('\n=== accounts ===\n', accounts);
        });        

        it("Setup OceanFarmingToken contract instance", async () => {
            oceanFarmingToken = await OceanFarmingToken.new({ from: accounts[0] });
        });

        it("Setup OceanGovernanceToken contract instance", async () => {
            oceanGovernanceToken = await OceanGovernanceToken.new({ from: accounts[0] });
        });

        it("Setup OceanFarmingPool contract instance", async () => {
            const _oceanFarmingToken = oceanFarmingToken.address;
            const _oceanGovernanceToken = oceanGovernanceToken.address;
            const _oceanGovernanceTokenPerBlock = 1000;
            const _startBlock = 0;
            const _endBlock = 1000;

            oceanFarmingPool = await OceanFarmingPool.new(_oceanFarmingToken, 
                                                          _oceanGovernanceToken, 
                                                          _oceanGovernanceTokenPerBlock, 
                                                          _startBlock, 
                                                          _endBlock, 
                                                          { from: accounts[0] });

            OCEAN_FARMING_POOL = oceanFarmingPool.address;
        });

        it("Transfer BAL into admin (deployer)", async () => {
            const bPool = await BPool.at(POOL, { from: deployer });
            let _BALBalance = await bPool.balanceOf(deployer, { from: deployer }); 
            let BALBalance = parseFloat(web3.utils.fromWei(_BALBalance));
            console.log('\n=== BAL balance of deployer (admin) ===', BALBalance);  /// [Result]: 100

            const amount = web3.utils.toWei('10', 'ether');
            await bPool.transfer(user1, amount, { from: deployer });
        });

        it("BAL balance of user1", async () => {
            const bPool = await BPool.at(POOL, { from: user1 });
            let _BALBalance = await bPool.balanceOf(user1, { from: user1 }); 
            let BALBalance = parseFloat(web3.utils.fromWei(_BALBalance));
            console.log('\n=== BAL balance of user1 ===', BALBalance);  /// [Result]: 10
        });
    });

    describe("Create Pool (Ocean-DataToken)", () => {
        it("Add pool data into the PoolInfo struct", async () => {
            /// [Todo]: 
            const _allocPoint = 100;
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

        it("Check the PoolInfo struct", async () => {
            /// [Todo]: Get Pool-IDs from the PoolInfo struct

        });        
    });

    describe("OceanFarmingPool", () => {
        it("Stake BPool (BToken) into OceanFarmingPool", async () => {
            const poolId = 0;     /// [Note]: Index number of the PoolInfo struct

            const _bPool = POOL;  /// [Note]: BToken is inherited into BPool. Therefore, BToken address is same with BPool address. (1 BPool has 1 BToken)
            const stakedBTokenAmount = web3.utils.toWei('0', 'ether');                /// 0 BAL
            //const stakedBTokenAmount = web3.utils.toWei(`${ 1 * 1e17 }`, 'wei');    /// 0.1 BAL
            //const stakedBTokenAmount = web3.utils.toWei('5', 'ether');              /// 5 BAL

            const bPool = await BPool.at(_bPool, { from: user1 });
            await bPool.approve(OCEAN_FARMING_POOL, stakedBTokenAmount, { from: user1 });

            /// [Todo]: Need to check "Pool-ID" in advance. Otherwise, a error of "invalid opcode" will happen.
            await oceanFarmingPool.stake(poolId, _bPool, stakedBTokenAmount, { from: user1 });
        });
    });

});
