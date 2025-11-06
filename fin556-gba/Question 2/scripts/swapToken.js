const { ethers } = require("hardhat");
const addresses = require("./addresses.json");

async function main() {
  const [signer] = await ethers.getSigners();

  // Your token and WETH contracts
  const token = await ethers.getContractAt("DemoTokenA", addresses.token0); // your token to swap (input)
  const weth = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    addresses.weth9
  ); // WETH (output)

  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory
  );
  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    addresses.router
  );

  // Get pair contract and reserves for token/WETH pair
  const pairAddress = await factory.getPair(
    await token.getAddress(),
    addresses.weth9
  );
  if (pairAddress === ethers.ZeroAddress) {
    throw new Error("Pair does not exist between token and WETH.");
  }
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  const reserves = await pair.getReserves();
  // Get ordered reserves by token addresses
  const [reserve0, reserve1] =
    (await token.getAddress()).toLowerCase() < addresses.weth9.toLowerCase()
      ? [reserves._reserve0, reserves._reserve1]
      : [reserves._reserve1, reserves._reserve0];

  // Show initial balances
  const initialTokenBalance = await token.balanceOf(signer.address);
  const initialWethBalance = await weth.balanceOf(signer.address);
  console.log(
    `Initial balances: token=${ethers.formatUnits(
      initialTokenBalance,
      18
    )}, WETH=${ethers.formatUnits(initialWethBalance, 18)}`
  );

  // Set desired amount of WETH to receive (output)
  const amountOut = ethers.parseEther("0.1"); // e.g., want to receive 1 WETH

  // Calculate amount of token needed as input (with Uniswap 0.3% fee)
  const reserveIn = reserve0; // token is input
  const reserveOut = reserve1; // WETH is output
  const expectedAmountIn =
    (reserveIn * amountOut * 1000n) / ((reserveOut - amountOut) * 997n) + 1n;

  // Add 5% slippage tolerance
  const amountInMax = (expectedAmountIn * 105n) / 100n;

  // Approve max token input to router if allowance insufficient
  const allowance = await token.allowance(signer.address, router.target);
  if (allowance < amountInMax) {
    const approveTx = await token.approve(router.target, amountInMax);
    await approveTx.wait();
    console.log(
      `Approved router to spend ${ethers.formatUnits(amountInMax, 18)} tokens`
    );
  } else {
    console.log("Sufficient allowance already set");
  }

  // Define swap path: token -> WETH
  const path = [await token.getAddress(), addresses.weth9];
  const to = signer.address;
  const block = await ethers.provider.getBlock("latest");
  const deadline = block.timestamp + 1000;

  // Execute swapTokensForExactTokens: swap token for exact amount of WETH
  const swapTx = await router.swapTokensForExactTokens(
    amountOut,
    amountInMax,
    path,
    to,
    deadline
  );
  await swapTx.wait();
  console.log(`Swap tx hash: ${swapTx.hash}`);

  // Show balances after swap
  const finalTokenBalance = await token.balanceOf(signer.address);
  const finalWethBalance = await weth.balanceOf(signer.address);
  console.log(
    `Final balances: token=${ethers.formatUnits(
      finalTokenBalance,
      18
    )}, WETH=${ethers.formatUnits(finalWethBalance, 18)}`
  );

  console.log(
    `Token spent: ${ethers.formatUnits(
      initialTokenBalance - finalTokenBalance,
      18
    )}`
  );
  console.log(
    `WETH received: ${ethers.formatUnits(
      finalWethBalance - initialWethBalance,
      18
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
