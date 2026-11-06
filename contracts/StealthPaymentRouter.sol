// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC5564Announcer {
    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes memory ephemeralPubKey,
        bytes memory metadata
    ) external;
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title StealthPaymentRouter
 * @notice Executes atomic cryptocurrency transfers and ERC-5564 announcements.
 * Guarantees that funds are delivered and the announcement is emitted in the exact same transaction.
 */
contract StealthPaymentRouter {
    address public immutable announcer;

    event StealthPaymentSent(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed token,
        uint256 amount,
        bytes ephemeralPubKey
    );

    constructor(address _announcer) {
        require(_announcer != address(0), "Invalid announcer");
        announcer = _announcer;
    }

    /**
     * @notice Send native coin (ETH / WBT) and emit ERC-5564 announcement atomically.
     */
    function sendStealthETH(
        address payable stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external payable {
        require(msg.value > 0, "Zero amount");
        require(stealthAddress != address(0), "Invalid stealth address");

        // 1. Deliver native value to one-time destination address
        (bool sent, ) = stealthAddress.call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        // 2. Announce event via official ERC-5564 Announcer
        IERC5564Announcer(announcer).announce(1, stealthAddress, ephemeralPubKey, metadata);

        emit StealthPaymentSent(1, stealthAddress, address(0), msg.value, ephemeralPubKey);
    }

    /**
     * @notice Send ERC-20 token (USDT / USDC) and emit ERC-5564 announcement atomically.
     */
    function sendStealthERC20(
        address token,
        address stealthAddress,
        uint256 amount,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external {
        require(amount > 0, "Zero amount");
        require(token != address(0), "Invalid token");
        require(stealthAddress != address(0), "Invalid stealth address");

        // 1. Transfer tokens from sender to one-time stealth destination
        bool transferred = IERC20(token).transferFrom(msg.value > 0 ? address(this) : msg.sender, stealthAddress, amount);
        require(transferred, "ERC20 transfer failed");

        // 2. Announce event via official ERC-5564 Announcer
        IERC5564Announcer(announcer).announce(1, stealthAddress, ephemeralPubKey, metadata);

        emit StealthPaymentSent(1, stealthAddress, token, amount, ephemeralPubKey);
    }
}
