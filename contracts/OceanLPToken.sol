pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { ERC20 } from "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import { ERC20Detailed } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


/***
 * @title - Ocean Liquidity Provider (LP) Token contract that represents a BPT (Balancer Pool Token) of a pair between OCEAN and DataToken. 
 * @notice - By using the Ocean LP Tokens, user can use same amount with BPT.
 **/
contract OceanLPToken is ERC20, ERC20Detailed {

    constructor() public ERC20Detailed("Ocean LP Token", "OLP", 18) {}

    function mint(address to, uint mintAmount) public returns (bool) {
        _mint(to, mintAmount);
    }

    function burn(address to, uint burnAmount) public returns (bool) {
        _burn(to, burnAmount);
    }

}
