pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/// Storage
import { OceanFarmingPoolStorages } from "./ocean-farming-pool/commons/OceanFarmingPoolStorages.sol";
import { OceanFarmingPoolEvents } from "./ocean-farming-pool/commons/OceanFarmingPoolEvents.sol";

/// Balancer
import { BToken } from "./ocean-v3/balancer/BToken.sol";

/// Ocean
import { OceanLPToken } from "./OceanLPToken.sol";
import { OceanGovernanceToken } from "./OceanGovernanceToken.sol";


/***
 * @title - Ocean Farming Pool contract that supply the Ocean Governance Token (OGT) as rewards to stakers.
 * @dev - msg.sender is a staker.
 **/
contract OceanFarmingPool is OceanFarmingPoolStorages, OceanFarmingPoolEvents {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    OceanLPToken public oceanLPToken;
    OceanGovernanceToken public oceanGovernanceToken;

    constructor(OceanLPToken _oceanLPToken, OceanGovernanceToken _oceanGovernanceToken) public {
        oceanLPToken = _oceanLPToken;
        oceanGovernanceToken = _oceanGovernanceToken;
    }

    /***
     * @notice - A user stake BToken    
     * @param _bToken - BToken should be a pair of Ocean and DataToken
     **/
    function stake(BToken _bToken, uint stakedBTokenAmount) public returns (bool) {
        BToken bToken = _bToken;
        bToken.transferFrom(msg.sender, address(this), stakedBTokenAmount);

        oceanLPToken.mint(msg.sender, stakedBTokenAmount);
    }

    /***
     * @notice - A user un-stake BToken
     * @param _bToken - BToken should be a pair of Ocean and DataToken
     **/
    function unStake(BToken _bToken, uint unStakedBTokenAmount) public returns (bool) {
        oceanLPToken.burn(msg.sender, unStakedBTokenAmount);

        BToken bToken = _bToken;
        bToken.transfer(msg.sender, unStakedBTokenAmount);
    
        uint rewardAmount = _computeRewardAmount();  /// [Todo]: Compute rewards amount
        oceanGovernanceToken.mint(msg.sender, rewardAmount);        
    }


    /***
     * @notice - Compute reward amount
     **/
    function _computeRewardAmount() internal returns (uint rewardAmount) {
        /// [Todo]: Write a logic for computing reward amount
    }



}
