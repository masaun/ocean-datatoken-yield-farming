const OceanFarmingToken = artifacts.require("OceanFarmingToken");

module.exports = async function(deployer) {
    await deployer.deploy(OceanFarmingToken);
};
