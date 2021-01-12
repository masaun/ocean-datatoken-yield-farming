const OceanFarmingPool = artifacts.require("OceanFarmingPool");
const OceanLPToken = artifacts.require("OceanLPToken");
const OceanFarmingToken = artifacts.require("OceanFarmingToken");
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

const _oceanLPToken = OceanLPToken.address;
const _oceanFarmingToken = OceanFarmingToken.address;
const _oceanGovernanceToken = OceanGovernanceToken.address;
const _oceanGovernanceTokenPerBlock = 1000;
const _startBlock = 0;
const _endBlock = 1000;

module.exports = async function(deployer, accounts, network) {
    if (network == 'test' || network == 'local') {  /// [Note]: Mainnet-fork approach with Truffle/Ganache-CLI/Infura 
        /// [Todo]: 
    } else if (network == 'ropsten') {
        /// [Todo]: 
    }

    await deployer.deploy(OceanFarmingPool,
                          _oceanLPToken, 
                          _oceanFarmingToken, 
                          _oceanGovernanceToken, 
                          _oceanGovernanceTokenPerBlock, 
                          _startBlock, 
                          _endBlock);
};
