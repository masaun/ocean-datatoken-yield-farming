const OceanGovernanceToken = artifacts.require("OceanGovernanceToken");

module.exports = async function(deployer) {
    await deployer.deploy(OceanGovernanceToken);
};
