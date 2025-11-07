const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  // Load addresses from JSON file in script folder
  const addresses = JSON.parse(fs.readFileSync("addresses.json"));

  const [signer] = await ethers.getSigners();

  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory
  );
  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    addresses.router
  );
  const token0 = await ethers.getContractAt("DemoTokenA", addresses.token0);
  const weth = await ethers.getContractAt("WETH9", addresses.weth9);
  const pair = await ethers.getContractAt("UniswapV2Pair", addresses.pair);

  // Get LP token balance
  const lpBalance = await pair.balanceOf(signer.address);
  console.log("LP Balance:", ethers.formatEther(lpBalance));

  // Balances before removing liquidity
  const beforeToken0 = await token0.balanceOf(signer.address);
  const beforeWETH = await weth.balanceOf(signer.address);

  // Approve router to spend LP tokens
  await pair.approve(addresses.router, lpBalance);

  // Deadline for transaction
  const block = await ethers.provider.getBlock("latest");
  const deadline = block.timestamp + 1000;

  // Define minimal amounts to avoid underflow (tune these values if needed)
  const amountTokenMin = 0;
  const amountETHMin = 0;

  try {
    await router.removeLiquidity(
      addresses.token0,
      addresses.weth9,
      lpBalance,
      amountTokenMin,
      amountETHMin,
      signer.address,
      deadline
    );
  } catch (error) {
    console.error("Failed to remove liquidity:", error);
    process.exit(1);
  }

  // Balances after removing liquidity
  const afterToken0 = await token0.balanceOf(signer.address);
  const afterWETH = await weth.balanceOf(signer.address);

  console.log(
    "Received Token0:",
    ethers.formatEther(afterToken0 - beforeToken0)
  );
  console.log("Received WETH9:", ethers.formatEther(afterWETH - beforeWETH));

  // Total LP token supply left (should be minimal due to liquidity removal)
  const totalSupply = await pair.totalSupply();
  console.log("Total LP Token Supply Left:", ethers.formatEther(totalSupply));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
