pragma solidity 0.8.20;

import "./OwnableMintableERC20.sol";

contract DemoTokenC is OwnableMintableERC20 {
    constructor() OwnableMintableERC20("DEMO-C", "DEMO-C") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
