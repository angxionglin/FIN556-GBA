pragma solidity 0.8.20;

import "./OwnableMintableERC20.sol";

contract DemoTokenB is OwnableMintableERC20 {
    constructor() OwnableMintableERC20("DEMO-B", "DEMO-B") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
