pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import { OceanLPToken } from "./OceanLPToken.sol";
import { OceanGovernanceToken } from "./OceanGovernanceToken.sol";


/***
 * @title - Ocean Farming Pool contract
 **/
contract OceanFarmingPool {

    OceanGovernanceToken public oceanGovernanceToken;

    constructor(OceanGovernanceToken _oceanGovernanceToken) public {
        oceanGovernanceToken = _oceanGovernanceToken;
    }

    function stake(OceanLPToken _oceanLPToken, uint lpTokenAmount) public returns (bool) {}

    function unStake(OceanLPToken _oceanLPToken, uint lpTokenAmount) public returns (bool) {}    

}
