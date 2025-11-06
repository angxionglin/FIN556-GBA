const { ethers } = require("hardhat");
require("dotenv").config();

let demoTokenAddress = process.env.DEMO_TOKEN_ADDRESS;

async function main() {
  if (!demoTokenAddress) {
    throw new Error("Please export DEMO_TOKEN_ADDRESS environment variable.");
  }

  // Deploy the Crowdsale contract
  const CrowdsaleFactory = await ethers.getContractFactory("Crowdsale");
  const crowdsale = await CrowdsaleFactory.deploy(
    demoTokenAddress,
    1000 // 1 ETH = 1000 DemoTokens
  );
  await crowdsale.waitForDeployment();
  crowdsaleAddress = await crowdsale.getAddress();
  console.log(`Crowdsale deployed to: ${crowdsaleAddress}`);

  // Transfer token ownership to the Crowdsale contract
  const demoToken = await ethers.getContractAt(
    "OwnableMintableDemoToken",
    demoTokenAddress
  );
  const transferTx = await demoToken.transferOwnership(crowdsaleAddress);
  await transferTx.wait();
  console.log(
    `Transferred token ownership to Crowdsale at: ${crowdsaleAddress}`
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
