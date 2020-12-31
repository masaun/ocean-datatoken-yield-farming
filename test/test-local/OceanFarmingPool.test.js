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
        before("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        before("Setup OceanFarmingToken contract instance", async () => {
            oceanFarmingToken = await OceanFarmingToken.new({ from: accounts[0] });
        });

        before("Setup OceanGovernanceToken contract instance", async () => {
            oceanGovernanceToken = await OceanGovernanceToken.new({ from: accounts[0] });
        });
    });

    describe("OceanFarmingPool", () => {

    });

});
