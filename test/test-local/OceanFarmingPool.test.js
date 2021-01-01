/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

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
