// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.20;

/**
 * @title ERC5564Announcer
 * @notice Standard ERC-5564 Announcer contract implementation.
 * https://eips.ethereum.org/EIPS/eip-5564
 */
contract ERC5564Announcer {
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes memory ephemeralPubKey,
        bytes memory metadata
    ) external {
        emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
    }
}
