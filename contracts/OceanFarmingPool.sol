pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import { OceanLPToken } from "./OceanLPToken.sol";
import { OceanGovernanceToken } from "./OceanGovernanceToken.sol";


/***
 * @title - Ocean Farming Pool contract that supply the Ocean Governance Token (OGT) as rewards to stakers.
 * @dev - msg.sender is a staker.
 **/
contract OceanFarmingPool {

    OceanGovernanceToken public oceanGovernanceToken;

    constructor(OceanGovernanceToken _oceanGovernanceToken) public {
        oceanGovernanceToken = _oceanGovernanceToken;
    }

    function stake(OceanLPToken _oceanLPToken, uint stakedLpTokenAmount) public returns (bool) {
        OceanLPToken oceanLPToken = _oceanLPToken;
        oceanLPToken.transferFrom(msg.sender, address(this), stakedLpTokenAmount);
    }

    function unStake(OceanLPToken _oceanLPToken, uint unStakedLpTokenAmount) public returns (bool) {
        OceanLPToken oceanLPToken = _oceanLPToken;
        oceanLPToken.transfer(msg.sender, unStakedLpTokenAmount);
    
        uint rewardAmount;  /// [Todo]: Compute rewards amount
        oceanGovernanceToken.mint(msg.sender, rewardAmount);        
    }    

}
