const { ethers } = require("hardhat");
const addresses = require("./addresses.json");

async function getPairAddress(token0, token1) {
    address0 = (await token0.getAddress()).toLowerCase();
    address1 = (await token1.getAddress()).toLowerCase();
    if (address0 > address1) {
        [address0, address1] = [address1, address0];
    }
    const pairAddress2 = ethers.getCreate2Address(
        factory.target,
        ethers.keccak256(
            ethers.solidityPacked(["address", "address"], [address0, address1])
        ),
        "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4" // init code hash (from getInitHashCode.js)
    );
    return pairAddress2;
}

async function main() {
    const [signer] = await ethers.getSigners();

    // Create Pair
    token0 = await ethers.getContractAt("DemoTokenA", addresses.token0);
    token1 = await ethers.getContractAt("DemoTokenB", addresses.token1);
    factory = await ethers.getContractAt("UniswapV2Factory", addresses.factory);

    pairAddress1 = await factory.getPair(
        await token0.getAddress(),
        await token1.getAddress()
    );
    if (pairAddress1 === ethers.ZeroAddress) {
        const tx = await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        await tx.wait();
        pairAddress1 = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
    }

    console.log(`Pair Address1: ${pairAddress1}`);

    pairAddress2 = await getPairAddress(token0, token1);
    console.log(`Pair address2: ${pairAddress2}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
