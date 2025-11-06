// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./MintableDemoToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableMintableDemoToken is MintableDemoToken, Ownable {
    constructor(
        uint256 initialSupply,
        address owner
    ) MintableDemoToken(initialSupply, owner) Ownable(owner) {
        transferOwnership(owner);
    }

    function mint(address to, uint256 amount) public override onlyOwner {
        super.mint(to, amount);
    }
}
