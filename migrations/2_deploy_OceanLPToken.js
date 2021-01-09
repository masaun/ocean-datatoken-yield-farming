const OceanLPToken = artifacts.require("OceanLPToken");

module.exports = async function(deployer) {
    await deployer.deploy(OceanLPToken);
};
