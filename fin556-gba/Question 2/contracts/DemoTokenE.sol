pragma solidity 0.8.20;

import "./OwnableMintableERC20.sol";

contract DemoTokenE is OwnableMintableERC20 {
    constructor() OwnableMintableERC20("DEMO-E", "DEMO-E") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
