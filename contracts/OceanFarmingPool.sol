pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import { OceanLPToken } from "./OceanLPToken.sol";


/***
 * @title - Ocean Farming Pool contract
 **/
contract OceanFarmingPool {

    constructor() public {}

    function stake(OceanLPToken _oceanLPToken, uint lpTokenAmount) public returns (bool) {}

    function unStake(OceanLPToken _oceanLPToken, uint lpTokenAmount) public returns (bool) {}    

}
