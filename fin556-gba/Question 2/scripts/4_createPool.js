// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// async function getPairAddress(token0, token1) {
//   address0 = (await token0.getAddress()).toLowerCase();
//   address1 = (await token1.getAddress()).toLowerCase();
//   if (address0 > address1) {
//     [address0, address1] = [address1, address0];
//   }
//   const pairAddress2 = ethers.getCreate2Address(
//     factory.target,
//     ethers.keccak256(
//       ethers.solidityPacked(["address", "address"], [address0, address1])
//     ),
//     "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4" // init code hash (from getInitHashCode.js)
//   );
//   return pairAddress2;
// }

// async function main() {
//   const [signer] = await ethers.getSigners();

//   // Create Pair
//   token0 = await ethers.getContractAt("DemoTokenA", addresses.token0);
//   token1 = await ethers.getContractAt("DemoTokenB", addresses.token1);
//   factory = await ethers.getContractAt("UniswapV2Factory", addresses.factory);

//   pairAddress1 = await factory.getPair(
//     await token0.getAddress(),
//     await token1.getAddress()
//   );
//   if (pairAddress1 === ethers.ZeroAddress) {
//     const tx = await factory.createPair(
//       await token0.getAddress(),
//       await token1.getAddress()
//     );
//     await tx.wait();
//     pairAddress1 = await factory.getPair(
//       await token0.getAddress(),
//       await token1.getAddress()
//     );
//   }

//   console.log(`Pair Address1: ${pairAddress1}`);

//   pairAddress2 = await getPairAddress(token0, token1);
//   console.log(`Pair address2: ${pairAddress2}`);
// }
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });
// const { ethers } = require("hardhat");
// const addresses = require("./addresses.json");

// const tokenNames = ["token0", "token1", "token2", "token3", "token4"];

// async function main() {
//   const [signer] = await ethers.getSigners();

//   // Load all token contract objects
//   const tokenContracts = {};
//   for (const name of tokenNames) {
//     tokenContracts[name] = await ethers.getContractAt("DemoTokenA", addresses[name]);
//   }

//   const factory = await ethers.getContractAt("UniswapV2Factory", addresses.factory);

//   // Create pairs for all unique unordered pairs
//   for (let i = 0; i < tokenNames.length; i++) {
//     for (let j = i + 1; j < tokenNames.length; j++) {
//       const nameA = tokenNames[i];
//       const nameB = tokenNames[j];
//       const tokenA = tokenContracts[nameA];
//       const tokenB = tokenContracts[nameB];
//       const addressA = addresses[nameA];
//       const addressB = addresses[nameB];

//       let pairAddress = await factory.getPair(addressA, addressB);
//       if (pairAddress === ethers.ZeroAddress) {
//         const tx = await factory.createPair(addressA, addressB);
//         await tx.wait();
//         pairAddress = await factory.getPair(addressA, addressB);
//         console.log(`Created pair for ${nameA}/${nameB}: ${pairAddress}`);
//       } else {
//         console.log(`Pair already exists for ${nameA}/${nameB}: ${pairAddress}`);
//       }
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

// async function main() {
//   const [signer] = await ethers.getSigners();

//   // Load all token contract objects
//   const tokenContracts = {};
//   for (const name of tokenNames) {
//     tokenContracts[name] = await ethers.getContractAt(
//       "DemoTokenA",
//       addresses[name]
//     );
//   }

//   const factory = await ethers.getContractAt(
//     "UniswapV2Factory",
//     addresses.factory
//   );

//   // Create pairs for all unique unordered pairs
//   for (let i = 0; i < tokenNames.length; i++) {
//     for (let j = i + 1; j < tokenNames.length; j++) {
//       const nameA = tokenNames[i];
//       const nameB = tokenNames[j];
//       const addressA = addresses[nameA];
//       const addressB = addresses[nameB];

//       let pairAddress = await factory.getPair(addressA, addressB);
//       if (pairAddress === ethers.ZeroAddress) {
//         const tx = await factory.createPair(addressA, addressB);
//         console.log(`createPair tx hash for ${nameA}/${nameB}: ${tx.hash}`);
//         await tx.wait();
//         pairAddress = await factory.getPair(addressA, addressB);
//         console.log(`Created pair for ${nameA}/${nameB}: ${pairAddress}`);
//       } else {
//         console.log(
//           `Pair already exists for ${nameA}/${nameB}: ${pairAddress}`
//         );
//       }
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
const otherTokens = ["token0", "token1", "token2", "token3", "token4"]; // Tokens to pair with WETH

async function main() {
  console.log("Creating WETH hub LP pairs...");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    addresses.factory
  );

  for (const tokenName of otherTokens) {
    const otherAddress = addresses[tokenName];

    // Log balance of tokens before
    const tokenContract = await ethers.getContractAt(
      "DemoTokenA",
      otherAddress
    );
    const wethContract = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      wethAddress
    );
    const tokenBalanceBefore = await tokenContract.balanceOf(deployer.address);
    const wethBalanceBefore = await wethContract.balanceOf(deployer.address);
    console.log(
      `Balances before creating pair (token=${tokenName}): Token=${ethers.formatUnits(
        tokenBalanceBefore,
        18
      )}, WETH=${ethers.formatUnits(wethBalanceBefore, 18)}`
    );

    // Create pair if not exists
    let pairAddress = await factory.getPair(wethAddress, otherAddress);
    if (pairAddress === ethers.ZeroAddress) {
      const tx = await factory.createPair(wethAddress, otherAddress);
      console.log(`Creating pair for WETH/${tokenName}, tx hash: ${tx.hash}`);
      await tx.wait();
      pairAddress = await factory.getPair(wethAddress, otherAddress);
      console.log(`Pair created at: ${pairAddress}`);
    } else {
      console.log(`Pair already exists for WETH/${tokenName}: ${pairAddress}`);
    }

    // Log LP balance before (should be zero)
    const pairContract = await ethers.getContractAt(
      "UniswapV2Pair",
      pairAddress
    );
    const lpBalanceBefore = await pairContract.balanceOf(deployer.address);
    console.log(
      `LP Balance for WETH/${tokenName} before: ${ethers.formatUnits(
        lpBalanceBefore,
        18
      )}`
    );

    console.log("------------------------------------------------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
