// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// async function main() {
//   console.log("Adding liquidity...");

//   const [deployer] = await ethers.getSigners();
//   console.log("Deployer address:", deployer.address);

//   // Get Tokens
//   const tokenA = await ethers.getContractAt("DemoTokenA", addresses.token0);
//   const tokenB = await ethers.getContractAt("DemoTokenB", addresses.token1);

//   // Check if Pair exists, if not return error
//   const factory = await ethers.getContractAt(
//     "UniswapV2Factory",
//     addresses.factory
//   );
//   const pairAddress = await factory.getPair(
//     await tokenA.getAddress(),
//     await tokenB.getAddress()
//   );
//   if (pairAddress === ethers.ZeroAddress) {
//     console.error("Error: Pair does not exist. Deploy the pair first.");
//     return;
//   }

//   console.log("Pair address:", pairAddress);

//   // Approve Tokens
//   const amountA = ethers.parseUnits("1000", "ether");
//   const amountB = ethers.parseUnits("5000", "ether");
//   let tx = await tokenA.approve(addresses.router, amountA);
//   await tx.wait();
//   tx = await tokenB.approve(addresses.router, amountB);
//   await tx.wait();

//   // Add Liquidity
//   const router = await ethers.getContractAt(
//     "UniswapV2Router02",
//     addresses.router
//   );
//   const block = await ethers.provider.getBlock();
//   const timestamp = block.timestamp + 600;
//   tx = await router.addLiquidity(
//     addresses.token0,
//     addresses.token1,
//     amountA,
//     amountB,
//     0,
//     0,
//     deployer.address,
//     timestamp
//   );
//   await tx.wait();
//   console.log("Liquidity added.");

//   //Get Pair
//   const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

//   //Check LP balance
//   const lpBalance = await pair.balanceOf(deployer.address);
//   console.log(
//     `LP Balance of ${deployer.address}:`,
//     ethers.formatUnits(lpBalance, 18)
//   );

//   //Check reserves
//   const reserves = await pair.getReserves();
//   const [reserves0, reserves1] =
//     (await tokenA.getAddress()) < (await tokenB.getAddress())
//       ? [reserves[0], reserves[1]]
//       : [reserves[1], reserves[0]];

//   console.log(
//     `Reserves: ${ethers.formatUnits(reserves0, 18)} / ${ethers.formatUnits(
//       reserves1,
//       18
//     )}`
//   );
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// const tokenNames = ["token0", "token1", "token2", "token3", "token4"];
// const liquidityAmounts = {
//   token0: "1000",
//   token1: "1000",
//   token2: "1000",
//   token3: "1000",
//   token4: "1000",
// }; // Edit as needed for your chosen amounts

// async function main() {
//   console.log("Adding liquidity for all unique pairs...");
//   const [deployer] = await ethers.getSigners();

//   const factory = await ethers.getContractAt(
//     "UniswapV2Factory",
//     addresses.factory
//   );
//   const router = await ethers.getContractAt(
//     "UniswapV2Router02",
//     addresses.router
//   );

//   const tokenContracts = {};
//   for (const name of tokenNames) {
//     tokenContracts[name] = await ethers.getContractAt(
//       "DemoTokenA",
//       addresses[name]
//     );
//   }

//   for (let i = 0; i < tokenNames.length; i++) {
//     for (let j = i + 1; j < tokenNames.length; j++) {
//       const nameA = tokenNames[i];
//       const nameB = tokenNames[j];
//       const tokenA = tokenContracts[nameA];
//       const tokenB = tokenContracts[nameB];
//       const addressA = addresses[nameA];
//       const addressB = addresses[nameB];

//       // Check if pair exists
//       const pairAddress = await factory.getPair(addressA, addressB);
//       if (pairAddress === ethers.ZeroAddress) {
//         console.error(
//           `Pair for ${nameA} & ${nameB} does not exist. Deploy the pair first.`
//         );
//         continue;
//       }

//       // Approve tokens
//       const amountA = ethers.parseUnits(liquidityAmounts[nameA], "ether");
//       const amountB = ethers.parseUnits(liquidityAmounts[nameB], "ether");
//       let tx = await tokenA.approve(addresses.router, amountA);
//       await tx.wait();
//       tx = await tokenB.approve(addresses.router, amountB);
//       await tx.wait();

//       // Add liquidity
//       const block = await ethers.provider.getBlock();
//       const deadline = block.timestamp + 600;
//       tx = await router.addLiquidity(
//         addressA,
//         addressB,
//         amountA,
//         amountB,
//         0,
//         0,
//         deployer.address,
//         deadline
//       );
//       await tx.wait();
//       console.log(`Liquidity added for ${nameA}/${nameB}`);

//       // Get LP balance and reserves for info
//       const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
//       const lpBalance = await pair.balanceOf(deployer.address);
//       console.log(
//         `LP Balance for ${nameA}/${nameB}:`,
//         ethers.formatUnits(lpBalance, 18)
//       );
//       const reserves = await pair.getReserves();
//       const [reserves0, reserves1] =
//         addressA < addressB
//           ? [reserves[0], reserves[1]]
//           : [reserves[1], reserves[0]];
//       console.log(
//         `Reserves (${nameA}/${nameB}): ${ethers.formatUnits(
//           reserves0,
//           18
//         )} / ${ethers.formatUnits(reserves1, 18)}`
//       );
//     }
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// const tokenNames = ["token0", "token1", "token2", "token3", "token4"];

// const liquidityAmounts = {
//   token0: "0.2",
//   token1: "0.2",
//   token2: "0.2",
//   token3: "0.2",
//   token4: "0.2",
// }; // set each to 0.2 tokens

// async function main() {
//   console.log("Adding liquidity for all unique pairs...");
//   const [deployer] = await ethers.getSigners();

//   const factory = await ethers.getContractAt(
//     "UniswapV2Factory",
//     addresses.factory
//   );
//   const router = await ethers.getContractAt(
//     "UniswapV2Router02",
//     addresses.router
//   );

//   const tokenContracts = {};
//   for (const name of tokenNames) {
//     tokenContracts[name] = await ethers.getContractAt(
//       "DemoTokenA",
//       addresses[name]
//     );
//   }

//   for (let i = 0; i < tokenNames.length; i++) {
//     for (let j = i + 1; j < tokenNames.length; j++) {
//       const nameA = tokenNames[i];
//       const nameB = tokenNames[j];
//       const tokenA = tokenContracts[nameA];
//       const tokenB = tokenContracts[nameB];
//       const addressA = addresses[nameA];
//       const addressB = addresses[nameB];

//       // Check if pair exists
//       const pairAddress = await factory.getPair(addressA, addressB);
//       if (pairAddress === ethers.ZeroAddress) {
//         console.error(
//           `Pair for ${nameA}/${nameB} does not exist. Deploy the pair first.`
//         );
//         continue;
//       }

//       // Prepare desired amounts
//       const amountA = ethers.parseUnits(liquidityAmounts[nameA], "ether");
//       const amountB = ethers.parseUnits(liquidityAmounts[nameB], "ether");

//       // Approve tokens
//       let tx = await tokenA.approve(addresses.router, amountA);
//       console.log(`Approve tx (${nameA}) hash: ${tx.hash}`);
//       await tx.wait();

//       tx = await tokenB.approve(addresses.router, amountB);
//       console.log(`Approve tx (${nameB}) hash: ${tx.hash}`);
//       await tx.wait();

//       // Check balances and allowances with BigInt comparisons for ethers.js v6
//       const balanceA = await tokenA.balanceOf(deployer.address);
//       const balanceB = await tokenB.balanceOf(deployer.address);
//       console.log(`${nameA} balance:`, ethers.formatUnits(balanceA, 18));
//       console.log(`${nameB} balance:`, ethers.formatUnits(balanceB, 18));

//       const allowanceA = await tokenA.allowance(
//         deployer.address,
//         addresses.router
//       );
//       const allowanceB = await tokenB.allowance(
//         deployer.address,
//         addresses.router
//       );
//       console.log(
//         `${nameA} allowance to router:`,
//         ethers.formatUnits(allowanceA, 18)
//       );
//       console.log(
//         `${nameB} allowance to router:`,
//         ethers.formatUnits(allowanceB, 18)
//       );

//       // Use BigInt for comparisons
//       if (BigInt(allowanceA) < BigInt(amountA)) {
//         console.warn(
//           `Warning: allowance of ${nameA} is less than amount to spend!`
//         );
//       }
//       if (BigInt(allowanceB) < BigInt(amountB)) {
//         console.warn(
//           `Warning: allowance of ${nameB} is less than amount to spend!`
//         );
//       }
//       if (BigInt(balanceA) < BigInt(amountA)) {
//         console.warn(`Warning: insufficient ${nameA} balance!`);
//       }
//       if (BigInt(balanceB) < BigInt(amountB)) {
//         console.warn(`Warning: insufficient ${nameB} balance!`);
//       }

//       // Add liquidity
//       const block = await ethers.provider.getBlock();
//       const deadline = block.timestamp + 600;
//       tx = await router.addLiquidity(
//         addressA,
//         addressB,
//         amountA,
//         amountB,
//         0,
//         0,
//         deployer.address,
//         deadline
//       );
//       console.log(`LP addLiquidity tx hash for ${nameA}/${nameB}: ${tx.hash}`);
//       await tx.wait();
//       console.log(`Liquidity added for ${nameA}/${nameB}`);

//       // Get LP balance and reserves
//       const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
//       const lpBalance = await pair.balanceOf(deployer.address);
//       console.log(
//         `LP Balance for ${nameA}/${nameB}:`,
//         ethers.formatUnits(lpBalance, 18)
//       );

//       const reserves = await pair.getReserves();
//       const [reserves0, reserves1] =
//         addressA < addressB
//           ? [reserves[0], reserves[1]]
//           : [reserves[1], reserves[0]];
//       console.log(
//         `Reserves (${nameA}/${nameB}): ${ethers.formatUnits(
//           reserves0,
//           18
//         )} / ${ethers.formatUnits(reserves1, 18)}`
//       );
//     }
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// const tokenNames = ["token0", "token1", "token2", "token3", "token4"];

// const liquidityAmountToken0 = "0.2"; // Only token0 funds LP

// async function main() {
//   console.log("Adding liquidity with only token0 funding all pairs...");
//   const [deployer] = await ethers.getSigners();

//   const factory = await ethers.getContractAt(
//     "UniswapV2Factory",
//     addresses.factory
//   );
//   const router = await ethers.getContractAt(
//     "UniswapV2Router02",
//     addresses.router
//   );

//   const tokenContracts = {};
//   for (const name of tokenNames) {
//     tokenContracts[name] = await ethers.getContractAt(
//       "DemoTokenA",
//       addresses[name]
//     );
//   }

//   for (let i = 0; i < tokenNames.length; i++) {
//     for (let j = i + 1; j < tokenNames.length; j++) {
//       const nameA = tokenNames[i];
//       const nameB = tokenNames[j];
//       const tokenA = tokenContracts[nameA];
//       const tokenB = tokenContracts[nameB];
//       const addressA = addresses[nameA];
//       const addressB = addresses[nameB];

//       // Check if pair exists
//       const pairAddress = await factory.getPair(addressA, addressB);
//       if (pairAddress === ethers.ZeroAddress) {
//         console.error(
//           `Pair for ${nameA}/${nameB} does not exist. Deploy the pair first.`
//         );
//         continue;
//       }

//       // Set amounts: token0 funds with 0.2, other token funds 0
//       const amountA =
//         nameA === "token0"
//           ? ethers.parseUnits(liquidityAmountToken0, "ether")
//           : 0n;
//       const amountB =
//         nameB === "token0"
//           ? ethers.parseUnits(liquidityAmountToken0, "ether")
//           : 0n;

//       // Approve only token0's amount, no need to approve zero amount tokens
//       if (amountA > 0n) {
//         let tx = await tokenA.approve(addresses.router, amountA);
//         console.log(`Approve tx (${nameA}) hash: ${tx.hash}`);
//         await tx.wait();
//       }
//       if (amountB > 0n) {
//         let tx = await tokenB.approve(addresses.router, amountB);
//         console.log(`Approve tx (${nameB}) hash: ${tx.hash}`);
//         await tx.wait();
//       }

//       // Check balances and allowances only for token0 since others provide zero
//       if (amountA > 0n) {
//         const balanceA = await tokenA.balanceOf(deployer.address);
//         const allowanceA = await tokenA.allowance(
//           deployer.address,
//           addresses.router
//         );
//         console.log(`${nameA} balance:`, ethers.formatUnits(balanceA, 18));
//         console.log(
//           `${nameA} allowance to router:`,
//           ethers.formatUnits(allowanceA, 18)
//         );
//         if (BigInt(allowanceA) < BigInt(amountA)) {
//           console.warn(
//             `Warning: allowance of ${nameA} less than amount to spend!`
//           );
//         }
//         if (BigInt(balanceA) < BigInt(amountA)) {
//           console.warn(`Warning: insufficient ${nameA} balance!`);
//         }
//       }
//       if (amountB > 0n) {
//         const balanceB = await tokenB.balanceOf(deployer.address);
//         const allowanceB = await tokenB.allowance(
//           deployer.address,
//           addresses.router
//         );
//         console.log(`${nameB} balance:`, ethers.formatUnits(balanceB, 18));
//         console.log(
//           `${nameB} allowance to router:`,
//           ethers.formatUnits(allowanceB, 18)
//         );
//         if (BigInt(allowanceB) < BigInt(amountB)) {
//           console.warn(
//             `Warning: allowance of ${nameB} less than amount to spend!`
//           );
//         }
//         if (BigInt(balanceB) < BigInt(amountB)) {
//           console.warn(`Warning: insufficient ${nameB} balance!`);
//         }
//       }

//       // Add liquidity with token0 amount and 0 for other token
//       const block = await ethers.provider.getBlock();
//       const deadline = block.timestamp + 600;
//       const tx = await router.addLiquidity(
//         addressA,
//         addressB,
//         amountA,
//         amountB,
//         0,
//         0,
//         deployer.address,
//         deadline
//       );
//       console.log(`LP addLiquidity tx hash for ${nameA}/${nameB}: ${tx.hash}`);
//       await tx.wait();
//       console.log(`Liquidity added for ${nameA}/${nameB}`);

//       // LP balance and reserves logging (optional)
//       const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
//       const lpBalance = await pair.balanceOf(deployer.address);
//       console.log(
//         `LP Balance for ${nameA}/${nameB}:`,
//         ethers.formatUnits(lpBalance, 18)
//       );

//       const reserves = await pair.getReserves();
//       const [reserves0, reserves1] =
//         addressA < addressB
//           ? [reserves[0], reserves[1]]
//           : [reserves[1], reserves[0]];
//       console.log(
//         `Reserves (${nameA}/${nameB}): ${ethers.formatUnits(
//           reserves0,
//           18
//         )} / ${ethers.formatUnits(reserves1, 18)}`
//       );
//     }
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

const { ethers } = require("hardhat");
const addresses = require("./addresses.json");

const wethAddress = addresses.weth9; // Wrapped ETH address as hub
const myTokenName = "token0"; // Only fund token0 pool
const liquidityAmountWETH = "0.5"; // Amount of WETH for liquidity
const liquidityAmountToken0 = "1000"; // Amount of token0 for liquidity

async function main() {
  console.log(`Adding liquidity to WETH/${myTokenName} pool only...`);
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    addresses.router
  );
  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory
  );

  // Use OpenZeppelin ERC20 ABI for WETH
  const wethContract = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    wethAddress
  );

  const tokenAddress = addresses[myTokenName];
  const tokenContract = await ethers.getContractAt("DemoTokenA", tokenAddress);

  // Get pair address
  const pairAddress = await factory.getPair(wethAddress, tokenAddress);
  if (pairAddress === ethers.ZeroAddress) {
    console.error(
      `Pool for WETH/${myTokenName} does not exist. Please create the pool first.`
    );
    process.exit(1);
  }
  const pairContract = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  // Log balances before
  const tokenBalanceBefore = await tokenContract.balanceOf(deployer.address);
  const wethBalanceBefore = await wethContract.balanceOf(deployer.address);
  const lpBalanceBefore = await pairContract.balanceOf(deployer.address);

  console.log(`Balances before adding liquidity:`);
  console.log(
    `${myTokenName} token balance: ${ethers.formatUnits(
      tokenBalanceBefore,
      18
    )}`
  );
  console.log(`WETH balance: ${ethers.formatUnits(wethBalanceBefore, 18)}`);
  console.log(`LP token balance: ${ethers.formatUnits(lpBalanceBefore, 18)}`);

  // Prepare amounts
  const amountWETH = ethers.parseUnits(liquidityAmountWETH, "ether");
  const amountToken0 = ethers.parseUnits(liquidityAmountToken0, "ether");

  // Approve token0 for router
  let tx = await tokenContract.approve(addresses.router, amountToken0);
  await tx.wait();

  // Add liquidity for WETH/token0 using addLiquidityETH
  tx = await router.addLiquidityETH(
    tokenAddress,
    amountToken0,
    0,
    0,
    deployer.address,
    (await ethers.provider.getBlock("latest")).timestamp + 600,
    { value: amountWETH }
  );
  console.log(`Added liquidity for WETH/${myTokenName}, tx hash: ${tx.hash}`);
  await tx.wait();

  // Log balances after
  const tokenBalanceAfter = await tokenContract.balanceOf(deployer.address);
  const wethBalanceAfter = await wethContract.balanceOf(deployer.address);
  const lpBalanceAfter = await pairContract.balanceOf(deployer.address);

  console.log(`Balances after adding liquidity:`);
  console.log(
    `${myTokenName} token balance: ${ethers.formatUnits(tokenBalanceAfter, 18)}`
  );
  console.log(`WETH balance: ${ethers.formatUnits(wethBalanceAfter, 18)}`);
  console.log(`LP token balance: ${ethers.formatUnits(lpBalanceAfter, 18)}`);

  console.log(`Liquidity successfully added for WETH/${myTokenName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
