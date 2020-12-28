pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { ERC20Detailed } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


/***
 * @title - Ocean Pool Token contract
 **/
contract OceanPoolToken is ERC20, ERC20Detailed {

    constructor() public ERC20Detailed("Ocean Pool Token", "OPT", 18) {}

}
