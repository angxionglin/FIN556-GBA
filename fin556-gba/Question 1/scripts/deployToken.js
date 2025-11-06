const { ethers } = require("hardhat");
async function main() {
  // Get the first signer/account to deploy the contract
  const signer = (await ethers.getSigners())[0];
  console.log(`Using account: ${await signer.getAddress()}`);

  // Deploy the OwnableMintableDemoToken contract
  const factory = await ethers.getContractFactory("OwnableMintableDemoToken");
  const demoToken = await factory.deploy(
    ethers.parseUnits("10000000", "ether"),
    signer.address
  );
  await demoToken.waitForDeployment();
  demoTokenAddress = await demoToken.getAddress();
  console.log(`XiongLinToken deployed to: ${demoTokenAddress}`);

  // Check gas usage
  const deploymentTx = demoToken.deploymentTransaction();
  const receipt = await ethers.provider.getTransactionReceipt(
    deploymentTx.hash
  );
  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  console.log(
    `Gas price: ${ethers.formatUnits(deploymentTx.gasPrice, "gwei")} gwei`
  );
  const totalCost = receipt.gasUsed * deploymentTx.gasPrice;
  console.log(`Total deployment cost: ${ethers.formatEther(totalCost)} ETH`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
