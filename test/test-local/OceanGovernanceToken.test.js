/// Using local network
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

/// Artifact of the OceanGovernanceToken contract 
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

/// Global variable
let oceanGovernanceToken;


/***
 * @dev - Execution COMMAND: $ truffle test ./test/test-local/OceanGovernanceToken.test.js
 **/
contract("OceanGovernanceToken", function(accounts) {

    describe("Setup", () => {
        it("Check all accounts", async () => {
            console.log('=== accounts ===\n', accounts);
        });        

        it("Setup OceanGovernanceToken contract instance", async () => {
            oceanGovernanceToken = await OceanGovernanceToken.new({ from: accounts[0] });
        });
    });

    describe("Mint OceanGovernanceToken", () => {
        it('Mint 1000000 OceanGovernanceToken (OGC)', async () => {
            await oceanGovernanceToken.mint(accounts[1], web3.utils.toWei("1000000", "ether"), { from: accounts[0] });
        }); 

        it('OceanGovernanceToken balance of accounts[1] should be 1000000 OGC', async () => {
            assert.equal(
                await oceanGovernanceToken.balanceOf(accounts[1]), 
                web3.utils.toWei("1000000", "ether"), 
                "Balance of accounts[1] should be 1000000 OGC"
            );

            console.log('=== OceanGovernanceToken (OGC) balance of accounts[1] ===\n', await oceanGovernanceToken.balanceOf(accounts[1]));
            let balance = await oceanGovernanceToken.balanceOf(accounts[1]);
            console.log('=== OceanGovernanceToken (OGC) balance of accounts[1] ===\n', parseFloat(web3.utils.fromWei(balance)));
        });
    });

});
