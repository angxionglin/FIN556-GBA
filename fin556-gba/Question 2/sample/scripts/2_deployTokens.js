const { ethers } = require("hardhat");
const { saveJson, delay } = require("./deployLib.js");
const path = require("path");
const ADDRESS_FILE = "addresses.json";
const filePath = path.join(__dirname, ADDRESS_FILE);

async function main() {
    // Get the first signer/account to deploy the contract
    const signer = (await ethers.getSigners())[0];
    console.log(`Using account: ${await signer.getAddress()}`);

    // Deploy Token0
    const TokenA = await ethers.getContractFactory("DemoTokenA");
    token0 = await TokenA.deploy();
    await token0.waitForDeployment();
    token0Address = await token0.getAddress();
    console.log(`Token0 deployed to: ${token0Address}`);
    await delay(3000);

    // Save token0 address
    saveJson(filePath, { token0: token0Address });

    // Deploy Token1
    const TokenB = await ethers.getContractFactory("DemoTokenB");
    token1 = await TokenB.deploy();
    await token1.waitForDeployment();
    token1Address = await token1.getAddress();
    console.log(`Token1 deployed to: ${token1Address}`);
    await delay(3000);

    // Save token1 address
    saveJson(filePath, { token1: token1Address });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
