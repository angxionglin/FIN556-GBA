pragma solidity 0.8.20;

import "./OwnableMintableERC20.sol";

contract DemoTokenD is OwnableMintableERC20 {
    constructor() OwnableMintableERC20("DEMO-D", "DEMO-D") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
