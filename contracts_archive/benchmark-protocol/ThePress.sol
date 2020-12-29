///---------------------------------------------------------
/// This is reference contract from the Benchmark Protocol.
/// (Only extract the Faucet contract)
///---------------------------------------------------------



/******************************************/
/*       Faucet starts here          */
/******************************************/

pragma solidity ^0.6.12;

contract Faucet is Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo 
    {
        uint256 amount;                 // How many LP tokens the user has provided.
        uint256 rewardDebt;             // Reward debt. See explanation below.
    }

    struct PoolInfo 
    {
        IERC20 lpToken;                 // Address of LP token contract.
        uint256 allocPoint;             // How many allocation points assigned to this pool.
        uint256 lastRewardBlock;        // Last block number that MARK distribution occured.
        uint256 accMarkPerShare;        // Accumulated MARK per share, times 1e12. See below.
    }

    IERC20 public MARK;                 // MARK token
    PoolInfo[] public poolInfo;         // Info of each pool.
    uint256 public markPerBlock;        // MARK tokens created per block.
    uint256 public startBlock;          // The block number at which MARK distribution starts.
    uint256 public endBlock;            // The block number at which MARK distribution ends.
    uint256 public totalAllocPoint = 0; // Total allocation poitns. Must be the sum of all allocation points in all pools.

    mapping (uint256 => mapping (address => UserInfo)) public userInfo;     // Info of each user that stakes LP tokens.

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(IERC20 _MARK, uint256 _markPerBlock, uint256 _startBlock, uint256 _endBlock) public {
        MARK = _MARK;
        markPerBlock = _markPerBlock;
        startBlock = _startBlock;
        endBlock = _endBlock;
    }

    /**
     * @dev Adds a new lp to the pool. Can only be called by the owner. DO NOT add the same LP token more than once.
     * @param _allocPoint How many allocation points to assign to this pool.
     * @param _lpToken Address of LP token contract.
     * @param _withUpdate Whether to update all LP token contracts. Should be true if MARK distribution has already begun.
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
            accMarkPerShare: 0
        }));
    }

    /**
     * @dev Update the given pool's MARK allocation point. Can only be called by the owner.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _allocPoint How many allocation points to assign to this pool.
     * @param _withUpdate Whether to update all LP token contracts. Should be true if MARK distribution has already begun.
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
     * @dev View function to see pending MARK on frontend.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _user Address of a specific user.
     * @return Pending MARK.
     */
    function pendingMark(uint256 _pid, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accMarkPerShare = pool.accMarkPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 markReward = multiplier.mul(markPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
            accMarkPerShare = accMarkPerShare.add(markReward.mul(1e12).div(lpSupply));
        }
        return user.amount.mul(accMarkPerShare).div(1e12).sub(user.rewardDebt);
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
        uint256 markReward = multiplier.mul(markPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        pool.accMarkPerShare = pool.accMarkPerShare.add(markReward.mul(1e12).div(lpSupply));
        pool.lastRewardBlock = block.number;
    }

    /**
     * @dev Deposit LP tokens to Faucet for MARK allocation.
     * @param _pid ID of a specific LP token pool. See index of PoolInfo[].
     * @param _amount Amount of LP tokens to deposit.
     */
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accMarkPerShare).div(1e12).sub(user.rewardDebt);
            safeMarkTransfer(msg.sender, pending);
        }
        pool.lpToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accMarkPerShare).div(1e12);
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
        uint256 pending = user.amount.mul(pool.accMarkPerShare).div(1e12).sub(user.rewardDebt);
        safeMarkTransfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accMarkPerShare).div(1e12);
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
     * @dev Safe mark transfer function, just in case if rounding error causes faucet to not have enough MARK.
     * @param _to Target address.
     * @param _amount Amount of MARK to transfer.
     */
    function safeMarkTransfer(address _to, uint256 _amount) internal {
        uint256 markBalance = MARK.balanceOf(address(this));
        if (_amount > markBalance) {
            MARK.transfer(_to, markBalance);
        } else {
            MARK.transfer(_to, _amount);
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
     * @dev Views total number of MARK tokens deposited for rewards.
     * @return MARK token balance of the faucet.
     */
    function balance() public view returns (uint256) {
        return MARK.balanceOf(address(this));
    }

    /**
     * @dev Transfer MARK tokens.
     * @return Success.
     */
    function transfer(address to, uint256 value) external onlyOwner returns (bool) {
        return MARK.transfer(to, value);
    }


    /**
     * @dev Update MARK per block.
     * @return MARK per block.
     */
    function updateMARKPerBlock(uint256 _markPerBlock) external onlyOwner returns (uint256) {
        require(_markPerBlock > 0, "Mark per Block must be greater than 0.");
        massUpdatePools();
        markPerBlock = _markPerBlock;
        return markPerBlock;
    }

    /**
     * @dev Define last block on which MARK reward distribution occurs.
     * @return Last block number.
     */
    function setEndBlock(uint256 _endBlock) external onlyOwner returns (uint256) {
        require(block.number < endBlock, "Reward distribution already ended.");
        require(_endBlock > block.number, "Block needs to be in the future.");
        endBlock = _endBlock;
        return endBlock;
    }

}
