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

/// Artifact of each contracts
const OceanFarmingPool = artifacts.require("OceanFarmingPool");
const OceanFarmingToken = artifacts.require("OceanFarmingToken");
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

/// Global variable
let oceanFarmingPool;
let oceanFarmingToken;
let oceanGovernanceToken;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/OceanFarmingPool.test.js
 **/
contract("OceanFarmingPool", function(accounts) {

    describe("BPool", () => {
        const { toWei } = web3.utils
        const { fromWei } = web3.utils
        const admin = accounts[0]

        const MAX = web3.utils.toTwosComplement(-1)

        let WETH; let DAI // addresses
        let weth; let dai // TTokens
        let factory // BPool factory
        let pool // first pool w/ defaults
        let POOL //   pool address

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

        it("Setup BPool and BToken", async () => {
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

    describe("Setup", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
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
        });
    });

    describe("OceanFarmingPool", () => {

    });

});
