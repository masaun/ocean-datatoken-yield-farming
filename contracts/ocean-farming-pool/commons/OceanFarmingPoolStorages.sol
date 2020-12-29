pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import { OceanFarmingPoolObjects } from "./OceanFarmingPoolObjects.sol";


/***
 * @title - OceanFarmingPoolStorages
 **/
contract OceanFarmingPoolStorages is OceanFarmingPoolObjects {

    PoolInfo[] public poolInfo;         // Info of each pool.
    uint256 public markPerBlock;        // MARK tokens created per block.
    uint256 public startBlock;          // The block number at which MARK distribution starts.
    uint256 public endBlock;            // The block number at which MARK distribution ends.
    uint256 public totalAllocPoint = 0; // Total allocation poitns. Must be the sum of all allocation points in all pools.

    mapping (uint256 => mapping (address => UserInfo)) public userInfo;     // Info of each user that stakes LP tokens.

}
