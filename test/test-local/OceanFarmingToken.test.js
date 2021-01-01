/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the OceanFarmingToken contract 
const OceanFarmingToken = artifacts.require("OceanFarmingToken");

/// Global variable
let oceanFarmingToken;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/OceanFarmingToken.test.js
 **/
contract("OceanFarmingToken", function(accounts) {

    describe("Setup", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup OceanFarmingToken contract instance", async () => {
            oceanFarmingToken = await OceanFarmingToken.new({ from: accounts[0] });
        });
    });

    describe("Mint OceanFarmingToken", () => {
        it('Mint 1000000 OceanFarmingToken (GLM)', async () => {
            await oceanFarmingToken.mint(accounts[1], web3.utils.toWei("1000000", "ether"), { from: accounts[0] });
        }); 

        it('OceanFarmingToken Balance of accounts[1] should be 1000000 GLM', async () => {
            assert.equal(
                await oceanFarmingToken.balanceOf(accounts[1]), 
                web3.utils.toWei("1000000", "ether"), 
                "Balance of accounts[1] should be 1000000 GLM"
            );

            console.log('=== Balance of accounts[1] ===\n', await oceanFarmingToken.balanceOf(accounts[1]));
            let _balance = await oceanFarmingToken.balanceOf(accounts[1]);
            let balance = parseFloat(web3.utils.fromWei(balance));
            console.log('=== Balance of accounts[1] ===\n', balance);
        });
    });

});
