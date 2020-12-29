pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// Balancer
import { BToken } from "./ocean/balancer/BToken.sol";

/// Ocean
import { OceanLPToken } from "./OceanLPToken.sol";
import { OceanGovernanceToken } from "./OceanGovernanceToken.sol";


/***
 * @title - Ocean Farming Pool contract that supply the Ocean Governance Token (OGT) as rewards to stakers.
 * @dev - msg.sender is a staker.
 **/
contract OceanFarmingPool {

    OceanLPToken public oceanLPToken;
    OceanGovernanceToken public oceanGovernanceToken;

    constructor(OceanLPToken _oceanLPToken, OceanGovernanceToken _oceanGovernanceToken) public {
        oceanLPToken = _oceanLPToken;
        oceanGovernanceToken = _oceanGovernanceToken;
    }

    function stake(BToken _bToken, uint stakedBTokenAmount) public returns (bool) {
        BToken bToken = _bToken;
        bToken.transferFrom(msg.sender, address(this), stakedBTokenAmount);

        oceanLPToken.mint(msg.sender, stakedBTokenAmount);
    }

    function unStake(BToken _bToken, uint unStakedBTokenAmount) public returns (bool) {
        oceanLPToken.burn(msg.sender, unStakedBTokenAmount);

        BToken bToken = _bToken;
        bToken.transfer(msg.sender, unStakedBTokenAmount);
    
        uint rewardAmount;  /// [Todo]: Compute rewards amount
        oceanGovernanceToken.mint(msg.sender, rewardAmount);        
    }    

}
