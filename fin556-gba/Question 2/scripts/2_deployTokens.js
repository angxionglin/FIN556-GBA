const { ethers } = require("hardhat");
const { saveJson, delay } = require("./deployLib.js");
const path = require("path");
const ADDRESS_FILE = "addresses.json";
const filePath = path.join(__dirname, ADDRESS_FILE);

async function main() {
    const signer = (await ethers.getSigners())[0];
    console.log(`Using account: ${await signer.getAddress()}`);

    // Object to hold all token addresses
    let addresses = {};

    // Deploy Token0 (DemoTokenA)
    const TokenA = await ethers.getContractFactory("DemoTokenA");
    const token0 = await TokenA.deploy();
    await token0.waitForDeployment();
    const token0Address = await token0.getAddress();
    console.log(`Token0 deployed to: ${token0Address}`);
    addresses.token0 = token0Address;
    await delay(3000);

    // Deploy Token1 (DemoTokenB)
    const TokenB = await ethers.getContractFactory("DemoTokenB");
    const token1 = await TokenB.deploy();
    await token1.waitForDeployment();
    const token1Address = await token1.getAddress();
    console.log(`Token1 deployed to: ${token1Address}`);
    addresses.token1 = token1Address;
    await delay(3000);

    // Deploy Token2 (DemoTokenC)
    const TokenC = await ethers.getContractFactory("DemoTokenC");
    const token2 = await TokenC.deploy();
    await token2.waitForDeployment();
    const token2Address = await token2.getAddress();
    console.log(`Token2 deployed to: ${token2Address}`);
    addresses.token2 = token2Address;
    await delay(3000);

    // Deploy Token3 (DemoTokenD)
    const TokenD = await ethers.getContractFactory("DemoTokenD");
    const token3 = await TokenD.deploy();
    await token3.waitForDeployment();
    const token3Address = await token3.getAddress();
    console.log(`Token3 deployed to: ${token3Address}`);
    addresses.token3 = token3Address;
    await delay(3000);

    // Deploy Token4 (DemoTokenE)
    const TokenE = await ethers.getContractFactory("DemoTokenE");
    const token4 = await TokenE.deploy();
    await token4.waitForDeployment();
    const token4Address = await token4.getAddress();
    console.log(`Token4 deployed to: ${token4Address}`);
    addresses.token4 = token4Address;
    await delay(3000);

    // Save all token addresses at once
    saveJson(filePath, addresses);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
