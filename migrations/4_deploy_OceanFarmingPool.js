const OceanFarmingPool = artifacts.require("OceanFarmingPool");
const OceanFarmingToken = artifacts.require("OceanFarmingToken");
const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

const _oceanFarmingToken = OceanFarmingToken.address;
const _oceanGovernanceToken = OceanGovernanceToken.address;
const _oceanGovernanceTokenPerBlock = '1000';
const _startBlock = '0';
const _endBlock = '1000';

module.exports = async function(deployer) {
    await deployer.deploy(OceanFarmingToken, 
                          _oceanFarmingToken, 
                          _oceanGovernanceToken, 
                          _oceanGovernanceTokenPerBlock, 
                          _startBlock, 
                          _endBlock);
};
