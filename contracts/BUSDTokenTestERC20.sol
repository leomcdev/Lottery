// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BUSD is ERC20 {
    IERC20 token;

    constructor(uint256 _totalSupply) ERC20("BUSD", "BUSD") {
        _mint(msg.sender, _totalSupply);
    }
}
