# Performing Token Swap and Add Liquidity on UniswapV2 on Testnet

⚠️ You must have completed the previous lesson on [Deploying ERC20 Tokens on Testnet](../../day-3/12-testnet/README.md) before you can continue with this lesson. Otherwise, please refer to:

-   [Deploying ERC20 Tokens on Testnet](../../day-3/12-testnet/README.md)
    -   You need to be using the same .env file because it contains the mnemonic for your wallet as well as the Alchemy API key and URL.
    -   You need to have test ETH balance in order to deploy the smart contracts and pay for gas fees.

## 🛠️ Lab Practise: Deploy and Swap Tokens on Local Hardhat Node with Scripts

**NOTE:** The steps below includes deploying the UniswapV2 contracts locally. This is only required for local testing. For public testnet, you can skip the deployment of UniswapV2 contracts because they are already deployed on the testnet.

### Step 1. Create .env file that contains your wallet mnemonic and Alchemy API key

-   **Create .env file**

    Copy the **.env** file from **../../day-3/12-testnet** to this folder.

### Step 2. Create a deployment library file

-   **Create scripts/deployLib.js**

    Create a new file called `deployLib.js` in the `scripts` folder to read and save contract addresses into a JSON file.

    ```javascript
    const fs = require("fs");

    // Function to safely update JSON file
    function saveJson(filePath, updates) {
        let data = {};

        // Read existing file if it exists
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, "utf8");
                data = JSON.parse(fileContent);
            } catch (error) {
                console.error("Error reading JSON file:", error);
                data = {};
            }
        }

        // Merge updates with existing data
        data = { ...data, ...updates };

        // Write back to file
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Updated ${filePath} successfully`);
        } catch (error) {
            console.error("Error writing JSON file:", error);
            throw error;
        }

        return data;
    }

    // Function to get a specific address by key
    function getAddress(filePath, key) {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File ${filePath} does not exist`);
            return null;
        }

        try {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(fileContent);

            if (key in data) {
                return data[key];
            } else {
                console.error(`Key "${key}" not found in ${filePath}`);
                return null;
            }
        } catch (error) {
            console.error("Error reading JSON file:", error);
            return null;
        }
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    exports = { saveJson, getAddress, delay };
    module.exports = { saveJson, getAddress, delay }; // For compatibility with both CommonJS and ES modules
    ```

### Step 3. Create a script to deploy WETH9 contract

-   **Create scripts/1_deployWETH9.js**

    Create a new file called `1_deployWETH9.js` in the `scripts` folder to deploy the WETH9 contract.

    WETH9 is just a ERC20 token that is used to wrap ETH so that it can be used in UniswapV2. It is required for deploying the UniswapV2 Router contract.

    ```javascript
    const { ethers } = require("hardhat");
    const { saveJson, delay } = require("./deployLib.js");
    const path = require("path");
    const ADDRESS_FILE = "addresses.json";
    const filePath = path.join(__dirname, ADDRESS_FILE);

    async function main() {
        // Get the first signer/account to deploy the contract
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        //Deploy WETH9 contract
        const WETH9 = await ethers.getContractFactory(
            "contracts/v2-periphery/test/WETH9.sol:WETH9"
        );
        const weth9 = await WETH9.deploy();
        await weth9.waitForDeployment();
        weth9Address = await weth9.getAddress();
        console.log(`WETH9 deployed to: ${weth9Address}`);
        // weth9Address = "0x412E840F46ec463D26B540d1C326fCc929003B76"

        await delay(3000);

        // Save token1 address
        saveJson(filePath, { weth9: weth9Address });
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### Step 4. Create a script to deploy your own ERC20 tokens

-   **Create scripts/2_deployTokens.js**

    Create a new file called `2_deployTokens.js` in the `scripts` folder to deploy your own ERC20 tokens. Note that the tokens are hardcoded to be `DemoTokenA` and `DemoTokenB` and the amounts minted are 1,000,000 ethers of tokens each.

    ```javascript
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
    ```

### Step 5. Create a script to deploy UniswapV2 Factory and Router contracts

-   **Create scripts/3_deployUniswap.js**

    Create a new file called `3_deployUniswap.js` in the `scripts` folder to deploy the UniswapV2 Factory and Router contracts.

    ```javascript
    const { ethers } = require("hardhat");
    const { saveJson, getAddress, delay } = require("./deployLib.js");
    const path = require("path");
    const ADDRESS_FILE = "addresses.json";
    const filePath = path.join(__dirname, ADDRESS_FILE);

    async function main() {
        // Get the first signer/account to deploy the contract
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        // Deploy UniswapV2Factory
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);
        await factory.waitForDeployment();
        factoryAddress = await factory.getAddress();
        setTimeout(() => {}, 3000);
        console.log(`UniswapV2Factory deployed to: ${factoryAddress}`);
        saveJson(filePath, { factory: factoryAddress });
        await delay(3000);

        // Deploy UniswapV2Router02
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        const weth9Address = getAddress(filePath, "weth9");
        router = await Router.deploy(
            factory.target,
            weth9Address // WETH address (not used in this test)
        );
        await router.waitForDeployment();
        routerAddress = await router.getAddress();
        console.log(`UniswapV2Router02 deployed to: ${routerAddress}`);
        saveJson(filePath, { router: routerAddress });
        await delay(3000);
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### Step 6. Create a script to create a liquidity pool for the two tokens

-   **Create scripts/4_createPool.js**

    ```js
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
                ethers.solidityPacked(
                    ["address", "address"],
                    [address0, address1]
                )
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
        factory = await ethers.getContractAt(
            "UniswapV2Factory",
            addresses.factory
        );

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
    ```

### Step 7. Create a script to add liquidity to the token pair

-   **Create scripts/5_addLiquidity.js**

    ```js
    const { ethers } = require("hardhat");
    const addresses = require("./addresses.json");

    async function main() {
        console.log("Adding liquidity...");

        const [deployer] = await ethers.getSigners();
        console.log("Deployer address:", deployer.address);

        // Get Tokens
        const tokenA = await ethers.getContractAt(
            "DemoTokenA",
            addresses.token0
        );
        const tokenB = await ethers.getContractAt(
            "DemoTokenB",
            addresses.token1
        );

        // Check if Pair exists, if not return error
        const factory = await ethers.getContractAt(
            "UniswapV2Factory",
            addresses.factory
        );
        const pairAddress = await factory.getPair(
            await tokenA.getAddress(),
            await tokenB.getAddress()
        );
        if (pairAddress === ethers.ZeroAddress) {
            console.error("Error: Pair does not exist. Deploy the pair first.");
            return;
        }

        console.log("Pair address:", pairAddress);

        // Approve Tokens
        const amountA = ethers.parseUnits("1000", "ether");
        const amountB = ethers.parseUnits("5000", "ether");
        let tx = await tokenA.approve(addresses.router, amountA);
        await tx.wait();
        tx = await tokenB.approve(addresses.router, amountB);
        await tx.wait();

        // Add Liquidity
        const router = await ethers.getContractAt(
            "UniswapV2Router02",
            addresses.router
        );
        const block = await ethers.provider.getBlock();
        const timestamp = block.timestamp + 600;
        tx = await router.addLiquidity(
            addresses.token0,
            addresses.token1,
            amountA,
            amountB,
            0,
            0,
            deployer.address,
            timestamp
        );
        await tx.wait();
        console.log("Liquidity added.");

        //Get Pair
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        //Check LP balance
        const lpBalance = await pair.balanceOf(deployer.address);
        console.log(
            `LP Balance of ${deployer.address}:`,
            ethers.formatUnits(lpBalance, 18)
        );

        //Check reserves
        const reserves = await pair.getReserves();
        const [reserves0, reserves1] =
            (await tokenA.getAddress()) < (await tokenB.getAddress())
                ? [reserves[0], reserves[1]]
                : [reserves[1], reserves[0]];

        console.log(
            `Reserves: ${ethers.formatUnits(
                reserves0,
                18
            )} / ${ethers.formatUnits(reserves1, 18)}`
        );
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### Step 8. Deploy and fund pool on local Hardhat Node

-   **start the local Hardhat Node**

    ```bash
    hh node
    ```

-   **In a parallel terminal, deploy the contracts and create the pool**

    ```bash
    hh run scripts/1_deployWETH9.js --network localhost
    hh run scripts/2_deployTokens.js --network localhost
    hh run scripts/3_deployUniswap.js --network localhost
    hh run scripts/4_createPool.js --network localhost
    hh run scripts/5_addLiquidity.js --network localhost
    ```

### Step 9. Deploy and fund pool on Public Testnet

When testing on public testnets, you do not have to deploy the UniswapV2 contracts yourself because it is assumed that they would have already been deployed.
If this case, you just need to use the deployed contract addresses in your scripts.

-   WETH9_ADDRESS: `0x7a1fd5C3185fe6261577AccEe220844Dc9026225`
-   UNISWAPV2_FACTORY_ADDRESS: `0x342D7aeC78cd3b581eb67655B6B7Bb157328590e`
-   UNISWAPV2_ROUTER02_ADDRESS: `0x5b491662E508c2E405500C8BF9d67E5dF780cD8e`

-   **Update addresses.json file**

    Replace the `weth9`, `factory` and `router` addresses in the `scripts/addresses.json` file with the above addresses.

-   **Deploy your tokens**

    ```bash
    hh run scripts/2_deployTokens.js --network hoodi

     # Sample output:
     #
     # Using account: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # Token0 deployed to: 0xd46ac798612964d992dc7ebCff6B903A76C667db
     # ✅ Updated /workspace/day-4/14-testnet-uniswap/scripts/addresses.json successfully
     # Token1 deployed to: 0x3c6AfCB44E34346ccB2d930e2B9FD028Ce98d7f3
     # ✅ Updated /workspace/day-4/14-testnet-uniswap/scripts/addresses.json successfully
    ```

-   **Create the pool**

    ```bash
    hh run scripts/4_createPool.js --network hoodi

     # Sample output:
     # Pair Address1: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
     # Pair address2: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
    ```

-   **Fund the pool**

    ```bash
    hh run scripts/5_addLiquidity.js --network hoodi

     # Sample output:
     # Adding liquidity...
     # Deployer address: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # Pair address: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
     # Liquidity added.
     # LP Balance of 0x6976827c1fC851546a202a5159a48Cac2b0649FF: 2236.067977499789695409
     # Reserves: 1000.0 / 5000.0
    ```
