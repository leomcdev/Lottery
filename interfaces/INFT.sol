// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface INFT {
    function mint(address _to) external;

    function burn(uint256 _tokenId) external;
}
