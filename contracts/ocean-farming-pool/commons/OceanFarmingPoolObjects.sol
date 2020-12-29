pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;


/***
 * @title - OceanFarmingPoolObjects
 **/
contract OceanFarmingPoolObjects {

    struct Staker {
        address addr;
        uint amount;
    }

    struct StakeData {
        address addr;
        uint amount;
    }

}
