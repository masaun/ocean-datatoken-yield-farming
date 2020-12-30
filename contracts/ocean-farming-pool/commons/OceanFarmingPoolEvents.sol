pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;


/***
 * @title - OceanFarmingPoolEvents
 **/
contract OceanFarmingPoolEvents {

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

}
