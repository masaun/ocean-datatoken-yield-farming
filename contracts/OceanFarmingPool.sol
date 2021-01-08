pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

/// [Note]: Using openzeppelin-solidity v2.4.0
import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { SafeMath } from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import { SafeERC20 } from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/// Storage
import { OceanFarmingPoolStorages } from "./ocean-farming-pool/commons/OceanFarmingPoolStorages.sol";
import { OceanFarmingPoolEvents } from "./ocean-farming-pool/commons/OceanFarmingPoolEvents.sol";

/// Balancer
/// [Note]: BPool is inherited into BPool. Therefore, BPool address is same with BPool address. (1 BPool has 1 BPool)
import { BPool } from "./ocean-v3/balancer/BPool.sol";
//import { BPool } from "./ocean-v3/balancer/BPool.sol";

/// Ocean
import { OceanFarmingToken } from "./OceanFarmingToken.sol";
import { OceanGovernanceToken } from "./OceanGovernanceToken.sol";


/***
 * @title - Ocean Farming Pool contract that supply the Ocean Governance Token (OGC) as rewards to stakers.
 * @dev - msg.sender is a staker.
 **/
contract OceanFarmingPool is OceanFarmingPoolStorages, OceanFarmingPoolEvents, Ownable {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    OceanFarmingToken public oceanFarmingToken;
    OceanGovernanceToken public oceanGovernanceToken;

    constructor(
        OceanFarmingToken _oceanFarmingToken, 
        OceanGovernanceToken _oceanGovernanceToken, 
        uint _oceanGovernanceTokenPerBlock, 
        uint _startBlock, 
        uint _endBlock
    ) public {
        oceanFarmingToken = _oceanFarmingToken;
        oceanGovernanceToken = _oceanGovernanceToken;

        oceanGovernanceTokenPerBlock = _oceanGovernanceTokenPerBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
    }

    /***
     * @notice - A user stake BPool (BToken)    
     * @param _bPool - BPool (BToken) should be a pair of Ocean and DataToken
     **/
    function stake(uint poolId, BPool _bPool, uint stakedBPoolAmount) public returns (bool) {
        BPool bPool = _bPool;
        bPool.transferFrom(msg.sender, address(this), stakedBPoolAmount);
        
        oceanFarmingToken.mint(msg.sender, stakedBPoolAmount);

        deposit(poolId, stakedBPoolAmount);
    }

    /***
     * @notice - A user un-stake BPool
     * @param _bPool - BPool should be a pair of Ocean and DataToken
     **/
    function unStake(uint poolId, BPool _bPool, uint unStakedBPoolAmount) public returns (bool) {
        oceanFarmingToken.burn(msg.sender, unStakedBPoolAmount);

        BPool bPool = _bPool;
        bPool.transfer(msg.sender, unStakedBPoolAmount);
    
        withdraw(poolId, unStakedBPoolAmount);

        /// [Note]: 2 rows below may be replaced with the withdraw() method above.
        //uint rewardAmount = _computeRewardAmount();  /// [Todo]: Compute rewards amount
        //oceanGovernanceToken.mint(msg.sender, rewardAmount);        
    }


    /***
     * @notice - Compute reward amount
     **/
    function _computeRewardAmount() internal returns (uint rewardAmount) {
        /// [Todo]: Write a logic for computing reward amount
    }



    ///-------------------------------------------------------
    /// Calculation logic for pool's rewards amount
    ///-------------------------------------------------------

    /**
     * @dev Adds a new lp to the pool. Can only be called by the owner. DO NOT add the same LP token more than once.
     * @param _allocPoint How many allocation points to assign to this pool.
     * @param _lpToken Address of LP token contract. (BPool inherit IERC20)
     * @param _withUpdate Whether to update all LP token contracts. Should be true if OceanGovernanceToken (OGToken) distribution has already begun.
     */
    function add(uint256 _allocPoint, IERC20 _lpToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: lastRewardBlock,
            accOceanGovernanceTokenPerShare: 0
        }));
    }

    /**
     * @dev Update the given pool's OceanGovernanceToken allocation point. Can only be called by the owner.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _allocPoint How many allocation points to assign to this pool.
     * @param _withUpdate Whether to update all LP token contracts. Should be true if OceanGovernanceToken distribution has already begun.
     */
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    /**
     * @dev Return reward multiplier over the given _from to _to blocks based on block count.
     * @param _from First block.
     * @param _to Last block.
     * @return Number of blocks.
     */
    function getMultiplier(uint256 _from, uint256 _to) internal view returns (uint256) {
        if (_to < endBlock) {
            return _to.sub(_from);
        } else if (_from >= endBlock) {
            return 0;
        } else {
            return endBlock.sub(_from);
        }
    }

    /**
     * @dev View function to see pending OceanGovernanceToken on frontend.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _user Address of a specific user.
     * @return Pending OceanGovernanceToken.
     */
    function pendingOceanGovernanceToken(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accOceanGovernanceTokenPerShare = pool.accOceanGovernanceTokenPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 oceanGovernanceTokenReward = multiplier.mul(oceanGovernanceTokenPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accOceanGovernanceTokenPerShare = accOceanGovernanceTokenPerShare.add(oceanGovernanceTokenReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accOceanGovernanceTokenPerShare).div(1e12).sub(user.rewardDebt);
    }

    /**
     * @dev Update reward vairables for all pools. Be careful of gas spending!
     */
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    /**
     * @dev Update reward variables of the given pool to be up-to-date.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     */
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 oceanGovernanceTokenReward = multiplier.mul(oceanGovernanceTokenPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        pool.accOceanGovernanceTokenPerShare = pool.accOceanGovernanceTokenPerShare.add(oceanGovernanceTokenReward.mul(1e12).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    /**
     * @dev Deposit LP tokens to Faucet for OceanGovernanceToken allocation.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _amount Amount of LP tokens to deposit.
     */
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accOceanGovernanceTokenPerShare).div(1e12).sub(user.rewardDebt);
            safeOceanGovernanceTokenTransfer(msg.sender, pending);
        }
        
        /// [Note]: Need to approve in advance
        pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);  /// [Note]: LP token is BPT (Balancer Pool Token)
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accOceanGovernanceTokenPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    /**
     * @dev Withdraw LP tokens from MasterChef.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _amount Amount of LP tokens to withdraw.
     */
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "Can't withdraw more token than previously deposited.");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accOceanGovernanceTokenPerShare).div(1e12).sub(user.rewardDebt);
        safeOceanGovernanceTokenTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accOceanGovernanceTokenPerShare).div(1e12);
        pool.lpToken.safeTransfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    /**
     * @dev Withdraw without caring about rewards. EMERGENCY ONLY.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     */
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    /**
     * @dev Safe OceanGovernanceToken transfer function, just in case if rounding error causes faucet to not have enough OceanGovernanceToken.
     * @param _to Target address.
     * @param _amount Amount of OceanGovernanceToken to transfer.
     */
    function safeOceanGovernanceTokenTransfer(address _to, uint256 _amount) internal {
        uint256 oceanGovernanceTokenBalance = oceanGovernanceToken.balanceOf(address(this));
        if (_amount > oceanGovernanceTokenBalance) {
            oceanGovernanceToken.transfer(_to, oceanGovernanceTokenBalance);
        } else {
            oceanGovernanceToken.transfer(_to, _amount);
        }
    }

    /**
     * @dev Views total number of LP token pools.
     * @return Size of poolInfo array.
     */
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }
    
    /**
     * @dev Views total number of OceanGovernanceToken tokens deposited for rewards.
     * @return OceanGovernanceToken token balance of the faucet.
     */
    function balance() public view returns (uint256) {
        return oceanGovernanceToken.balanceOf(address(this));
    }

    /**
     * @dev Transfer OceanGovernanceToken tokens.
     * @return Success.
     */
    function transfer(address to, uint256 value) external onlyOwner returns (bool) {
        return oceanGovernanceToken.transfer(to, value);
    }


    /**
     * @dev Update OceanGovernanceToken per block.
     * @return OceanGovernanceToken per block.
     */
    function updateOceanGovernanceTokenPerBlock(uint256 _oceanGovernanceTokenPerBlock) external onlyOwner returns (uint256) {
        require(_oceanGovernanceTokenPerBlock > 0, "OceanGovernanceToken per Block must be greater than 0.");
        massUpdatePools();
        oceanGovernanceTokenPerBlock = _oceanGovernanceTokenPerBlock;
        return oceanGovernanceTokenPerBlock;
    }

    /**
     * @dev Define last block on which OceanGovernanceToken reward distribution occurs.
     * @return Last block number.
     */
    function setEndBlock(uint256 _endBlock) external onlyOwner returns (uint256) {
        require(block.number < endBlock, "Reward distribution already ended.");
        require(_endBlock > block.number, "Block needs to be in the future.");
        endBlock = _endBlock;
        return endBlock;
    }


}
