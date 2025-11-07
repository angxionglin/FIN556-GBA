pragma solidity 0.8.20;

import "./OwnableMintableERC20.sol";

contract DemoTokenA is OwnableMintableERC20 {
    constructor() OwnableMintableERC20("DEMO-A", "DEMO-A") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
