import { ethers } from "ethers";

const useDapp = ({
  setSigner,
  uniswapRouterAddress,
  uniswapFactoryAddress,
  tokenAddrA,
  tokenAddrB,
}) => {
  const getBalance = async (signer) => {
    const address = signer.address;

    const tokenA = new ethers.Contract(
      tokenAddrA,
      ["function balanceOf(address) view returns(uint)"],
      signer
    );

    const tokenB = new ethers.Contract(
      tokenAddrB,
      ["function balanceOf(address) view returns(uint)"],
      signer
    );

    // Pool
    const factory = new ethers.Contract(
      uniswapFactoryAddress,
      ["function getPair(address,address) view returns(address)"],
      signer
    );
    console.log(
      `Getting poolAddress for UniSwapFactory(${uniswapFactoryAddress})`
    );
    console.log(
      `Getting poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB})`
    );
    const poolAddress = await factory.getPair(tokenAddrB, tokenAddrA);
    console.log(
      `poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB}) is ${poolAddress}`
    );
    const pool = new ethers.Contract(
      poolAddress,
      [
        "function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)",
        "function balanceOf(address) view returns(uint)",
      ],
      signer
    );

    // Get Reserves
    const { reserve0, reserve1 } = await pool.getReserves();
    const reservesA = tokenAddrA < tokenAddrB ? reserve0 : reserve1;
    const reservesB = tokenAddrA > tokenAddrB ? reserve0 : reserve1;

    return {
      balanceA: (await tokenA.balanceOf(address))?.toString(),
      balanceB: (await tokenB.balanceOf(address))?.toString(),
      liquidity: (await pool.balanceOf(address))?.toString(),
      reservesA: reservesA.toString(),
      reservesB: reservesB.toString(),
    };
  };

  function _getAmountOut(amountIn, reserveIn, reserveOut) {
    if (!amountIn || !reserveIn || !reserveOut) {
      throw new Error(
        "Invalid input: amountIn, reserveIn, and reserveOut must be provided"
      );
    }
    const amountInWithFee = ethers.toBigInt(amountIn) * ethers.toBigInt(997);
    const numerator = amountInWithFee * ethers.toBigInt(reserveOut);
    const denominator =
      ethers.toBigInt(reserveIn) * ethers.toBigInt(1000) + amountInWithFee;
    return numerator / denominator;
  }

  const _getReserves = async (factory, { TOKEN_0, TOKEN_1 }, account) => {
    const poolAddress = await factory.getPair(TOKEN_0, TOKEN_1);
    if (poolAddress === ethers.ZeroAddress) {
      throw new Error("No pool found for the given token pair");
    }
    const pool = new ethers.Contract(
      poolAddress,
      [
        "function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)",
      ],
      account
    );
    const { reserve0, reserve1 } = await pool.getReserves();
    return {
      reserveA: TOKEN_0 < TOKEN_1 ? reserve0 : reserve1,
      reserveB: TOKEN_0 > TOKEN_1 ? reserve0 : reserve1,
    };
  };

  const sellTokens = async (inputAmt, inputAddr, outputAddr, account) => {
    // Get Reserves
    const factory = new ethers.Contract(
      uniswapFactoryAddress,
      ["function getPair(address,address) view returns(address)"],
      account
    );

    const reserves = await _getReserves(
      factory,
      {
        TOKEN_0: inputAddr,
        TOKEN_1: outputAddr,
      },
      account
    );

    console.log("Reserves:", reserves);

    if (!reserves || !reserves.reserveA || !reserves.reserveB) {
      throw new Error("Failed to fetch reserves from the pool");
    }

    // Get OutputAmt
    const outputAmt = _getAmountOut(
      inputAmt,
      reserves.reserveA,
      reserves.reserveB
    );

    // Load contract A and contract B
    const uniswap = new ethers.Contract(
      uniswapRouterAddress,
      [`function swapExactTokensForTokens(uint,uint,address[],address,uint)`],
      account
    );

    // Approve router to withdraw 2000 TokenA from trader account
    const inputToken = new ethers.Contract(
      inputAddr,
      ["function approve(address,uint)"],
      account
    );
    const response = await inputToken.approve(uniswapRouterAddress, inputAmt);
    await response.wait();
    console.log("trade: approved. receipt=", response.hash);

    // Trade 2000 TokenA for 1662 TokenB using trader account
    const ts = (await provider.getBlock()).timestamp + 1000;
    await uniswap.swapExactTokensForTokens(
      inputAmt,
      outputAmt,
      [inputAddr, outputAddr],
      await account.getAddress(),
      ts
    );

    return outputAmt;
  };

  const buyTokens = async (inputAmt, inputAddr, outputAddr, account) => {
    throw new Error("Not implemented yet");
  };

  const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : null;

  const connect = async () => {
    if (!provider) return null;

    await provider.send("eth_requestAccounts", []); // Login to metamask
    const signer = await provider.getSigner();

    const { chainId } = await provider.getNetwork();
    console.log("Connected to chainId:", chainId);

    // const DESIRED_CHAIN_ID = 31337; // This is the default chain ID for hardhat localhost network
    // if (chainId !== DESIRED_CHAIN_ID) {
    //     await provider.send("wallet_switchEthereumChain", [
    //         { chainId: `0x${DESIRED_CHAIN_ID.toString(16)}` }, // Must be in hex format
    //     ]);
    // }

    const DESIRED_CHAIN_ID = 560048; // This is the default chain ID for Hoodi Testnet
    if (chainId !== DESIRED_CHAIN_ID) {
      await provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${DESIRED_CHAIN_ID.toString(16)}` }, // Must be in hex format
      ]);
    }

    // Get and set the address
    setSigner(signer);

    return signer;
  };
  return {
    connect,
    getBalance,
    sellTokens,
    buyTokens,
  };
};

export default useDapp;
