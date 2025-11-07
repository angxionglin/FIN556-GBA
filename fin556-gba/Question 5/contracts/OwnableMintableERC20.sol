pragma solidity 0.8.20;
import "./MintableERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableMintableERC20 is MintableERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_
    ) MintableERC20(name_, symbol_) Ownable(msg.sender) {}

    // Override mint to add onlyOwner modifier
    function mint(address to, uint256 amount) public override onlyOwner {
        super.mint(to, amount);
    }
}
