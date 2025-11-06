// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract MintableDemoToken is ERC20 {
    constructor(
        uint256 initialSupply,
        address owner
    ) ERC20("DemoToken", "DEMO") {
        _mint(owner, initialSupply);
    }
    function mint(address to, uint256 amount) public virtual {
        _mint(to, amount);
    }
}
