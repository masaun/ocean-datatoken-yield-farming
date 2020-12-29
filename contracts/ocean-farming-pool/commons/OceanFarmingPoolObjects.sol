pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


/***
 * @title - OceanFarmingPoolObjects
 **/
contract OceanFarmingPoolObjects {

    struct UserInfo {
        uint256 amount;                 // How many LP tokens the user has provided.
        uint256 rewardDebt;             // Reward debt. See explanation below.
    }

    struct PoolInfo {
        IERC20 lpToken;                 // Address of LP token contract.
        uint256 allocPoint;             // How many allocation points assigned to this pool.
        uint256 lastRewardBlock;        // Last block number that MARK distribution occured.
        uint256 accMarkPerShare;        // Accumulated MARK per share, times 1e12. See below.
    }


}
