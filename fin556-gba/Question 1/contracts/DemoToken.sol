// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DemoToken is ERC20 {
    constructor(
        uint256 totalSupply_,
        address owner_
    ) ERC20("XiongLinToken", "XL") {
        _mint(owner_, totalSupply_);
    }
}
