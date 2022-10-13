// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CoriteToken is ERC20, AccessControl {
    constructor(address _default_admin_role, uint256 _totalSupply)
        ERC20("LTK", "Corite tickets")
    {
        _setupRole(DEFAULT_ADMIN_ROLE, _default_admin_role);
        _mint(_default_admin_role, _totalSupply);
    }
}
