import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CssBaseline,
  Container,
  Card,
  Button,
  TextField,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import useDapp from "./useDapp";
const App = () => {
  // Insert the subsequent code here
  const [chainId, setChainId] = useState(null);
  const [isOnHoodi, setIsOnHoodi] = useState(false);
  const DESIRED_CHAIN_ID = 560048; // Hoodi Testnet chain ID

  const [signer, setSigner] = useState(null);
  const [tokenAddrA, setTokenAddrA] = useState("");
  const [tokenAddrB, setTokenAddrB] = useState("");
  const [uniswapRouterAddress, setUniswapRouterAddress] = useState("");
  const [uniswapFactoryAddress, setUniswapFactoryAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amtA, setAmtA] = useState(0);
  const [amtB, setAmtB] = useState(0);
  const { connect, getBalance, sellTokens, buyTokens } = useDapp({
    setSigner,
    uniswapRouterAddress,
    uniswapFactoryAddress,
    tokenAddrA,
    tokenAddrB,
  });
  const connectAndCheckChain = async () => {
    const signerTmp = await connect();
    if (!signerTmp) return;
    setSigner(signerTmp);

    const network = await signerTmp.provider.getNetwork();
    const normalizedChainId = Number(network.chainId);
    setChainId(normalizedChainId);
    setIsOnHoodi(normalizedChainId === DESIRED_CHAIN_ID);
  };

  const handleCheckBalance = async () => {
    setIsLoading(true);
    try {
      const balance = await getBalance(signer);
      console.log(balance);
      setBalance(balance);
    } catch (error) {
      console.error("Error fetching balances:", error);
      alert("Failed to fetch balances. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleBuy = async (aOrB) => {
    if (!amtA && !amtB) {
      alert("Invalid amount");
      return;
    }
    setIsLoading(true);
    try {
      if (aOrB === "A") {
        const amtB = await buyTokens(amtA, tokenAddrB, tokenAddrA, signer);
        console.log(`Bought ${amtA} of A with ${amtB} of B`);
        return;
      } else if (aOrB === "B") {
        const amtA = await buyTokens(amtB, tokenAddrA, tokenAddrB, signer);
        console.log(`Bought ${amtB} of B with ${amtA} of A`);
        return;
      } else {
        throw new Error("Invalid token type. Must be 'A' or 'B'");
      }
    } catch (error) {
      console.error("Error buying tokens:", error);
      alert("Failed to buy tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSell = async (aOrB) => {
    if (!amtA && !amtB) {
      alert("Invalid amount");
      return;
    }
    setIsLoading(true);
    try {
      if (aOrB === "A") {
        const amtB = await sellTokens(amtA, tokenAddrA, tokenAddrB, signer);
        console.log(`Sold ${amtA} of A for ${amtB} of B`);
        return;
      } else if (aOrB === "B") {
        const amtA = await sellTokens(amtB, tokenAddrB, tokenAddrA, signer);
        console.log(`Sold ${amtB} of B for ${amtA} of A`);
        return;
      } else {
        throw new Error("Invalid token type. Must be 'A' or 'B'");
      }
    } catch (error) {
      console.error("Error selling tokens:", error);
      alert("Failed to sell tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const start = async () => {
      // const result = await connect();
      await connectAndCheckChain();
      if (result?.error) {
        alert(
          "MetaMask is not installed. Please install MetaMask to use this DApp."
        );
      }
    };
    start();
  }, []);
  return (
    <>
      <CssBaseline />
      <Container>
        <h1>DEX DAPP</h1>
        <p>Connected to Metamask with address: {signer?.address}</p>
        {!isOnHoodi && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "warning.main",
              color: "warning.contrastText",
            }}
          >
            <p>
              You are connected to chain ID {chainId}. This DApp requires Hoodi
              Testnet (chain ID {DESIRED_CHAIN_ID}).
            </p>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await signer.provider.send("wallet_switchEthereumChain", [
                    { chainId: `0x${DESIRED_CHAIN_ID.toString(16)}` },
                  ]);
                  // Re-create provider and signer after chain switch
                  const provider = new ethers.BrowserProvider(window.ethereum);
                  const newSigner = await provider.getSigner();
                  setSigner(newSigner);

                  const network = await provider.getNetwork();
                  const normalizedChainId = Number(network.chainId);
                  setChainId(normalizedChainId);
                  setIsOnHoodi(normalizedChainId === DESIRED_CHAIN_ID);
                } catch (switchError) {
                  alert("Failed to switch network. Please switch manually.");
                  console.log(switchError);
                }
              }}
            >
              Switch Network
            </Button>
          </Box>
        )}
        <h2 style={{ marginBottom: "16px" }}>Contract Configuration</h2>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Uniswap Router Address"
            sx={{ flex: 1 }}
            value={uniswapRouterAddress}
            onChange={(e) => {
              setUniswapRouterAddress(e.target.value);
            }}
          />
          <TextField
            label="Uniswap Factory Address"
            sx={{ flex: 1 }}
            value={uniswapFactoryAddress}
            onChange={(e) => {
              setUniswapFactoryAddress(e.target.value);
            }}
          />
        </Box>
        <Divider sx={{ my: 3 }} />
        <h2 style={{ marginBottom: "16px" }}>Liquidity Pool</h2>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            id="tokenAddrA"
            label="TokenA Address"
            value={tokenAddrA}
            sx={{ flex: 1 }}
            onChange={(e) => {
              setTokenAddrA(e.target.value);
            }}
          ></TextField>
          <TextField
            id="tokenAddrB"
            label="TokenB Address"
            value={tokenAddrB}
            sx={{ flex: 1 }}
            onChange={(e) => {
              setTokenAddrB(e.target.value);
            }}
          ></TextField>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Button onClick={handleCheckBalance} variant="contained">
              Check
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
              Token Balance
            </h3>
            <Card sx={{ p: 3, flexGrow: 1 }}>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>TokenA: {balance?.balanceA}</li>
                <li>TokenB: {balance?.balanceB}</li>
                <li>Liquidity: {balance?.liquidity}</li>
              </ul>
            </Card>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
              Pool Reserves
            </h3>
            <Card sx={{ p: 3, flexGrow: 1 }}>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>TokenA: {balance?.reservesA}</li>
                <li>TokenB: {balance?.reservesB}</li>
              </ul>
            </Card>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <h2 style={{ marginBottom: "16px" }}>Token Swap</h2>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            id="amtA"
            label="TokenA Amount"
            onChange={(e) => {
              setAmtA(e.target.value);
            }}
            fullWidth
          ></TextField>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => handleBuy("A")}>
              Buy
            </Button>
            <Button variant="outlined" onClick={() => handleSell("A")}>
              Sell
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            id="amtB"
            label="TokenB Amount"
            onChange={(e) => {
              setAmtB(e.target.value);
            }}
            fullWidth
          ></TextField>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={() => handleBuy("B")}>
              Buy
            </Button>
            <Button variant="outlined" onClick={() => handleSell("B")}>
              Sell
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};
export default App;
