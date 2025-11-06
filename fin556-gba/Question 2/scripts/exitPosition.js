const { ethers } = require("hardhat");
const addresses = require("./addresses.json");

async function main() {
  const [signer] = await ethers.getSigners();

  const token0 = await ethers.getContractAt("DemoTokenA", addresses.token0);
  const token1 = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    addresses.weth9
  );
  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory
  );
  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    addresses.router
  );

  // Get pair address for token0/token1 (WETH9)
  const pairAddress = await factory.getPair(
    await token0.getAddress(),
    await token1.getAddress()
  );
  if (pairAddress === ethers.ZeroAddress) {
    throw new Error("No liquidity pair found for tokens");
  }
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  // Get LP token balance
  const lpBalance = await pair.balanceOf(signer.address);
  if (lpBalance.isZero()) {
    console.log("No liquidity to remove");
    return;
  }
  console.log("LP Balance:", ethers.formatEther(lpBalance));

  // Balances before removal
  const beforeLiquidation0 = await token0.balanceOf(signer.address);
  const beforeLiquidation1 = await token1.balanceOf(signer.address);

  // Approve router to spend LP tokens
  const approveTx = await pair.approve(await router.getAddress(), lpBalance);
  await approveTx.wait();

  // Deadline for removal
  const block = await ethers.provider.getBlock("latest");
  const deadline = block.timestamp + 1000;

  // Remove full liquidity position
  const removeTx = await router.removeLiquidity(
    await token0.getAddress(),
    await token1.getAddress(),
    lpBalance,
    0,
    0,
    signer.address,
    deadline
  );
  await removeTx.wait();

  // Balances after removal
  const afterLiquidation0 = await token0.balanceOf(signer.address);
  const afterLiquidation1 = await token1.balanceOf(signer.address);

  console.log(
    "Receives Token0:",
    ethers.formatEther(afterLiquidation0.sub(beforeLiquidation0))
  );
  console.log(
    "Receives Token1:",
    ethers.formatEther(afterLiquidation1.sub(beforeLiquidation1))
  );

  // Total LP supply remaining
  const totalSupply = await pair.totalSupply();
  console.log("Total Supply:", totalSupply.toString());

  // Optional: you can assert total supply equals 1000n if needed (minimum liquidity)
  // Uncomment if testing environment with chai
  // expect(totalSupply).to.equal(1000n);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
