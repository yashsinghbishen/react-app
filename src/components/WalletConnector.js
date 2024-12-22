import React, { useState } from "react";
import { ethers } from "ethers";
const WalletConnector = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [daiBalance, setDaiBalance] = useState(null);
  const [daiTokenName, setDaiTokenName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const CHAIN_ID = process.env.REACT_APP_CHAIN_ID;
  const CHAIN_NAME = process.env.REACT_APP_RPC_URL;
  const RPC_URL = process.env.REACT_APP_RPC_URL;
  const DAI_CONTRACT_ADDRESS = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;

  const daiAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
  ];

  const connectWallet = async () => {
    setIsLoading(true); // Start loader
    try {
      if (!window.ethereum) {
        alert("Metamask is not installed!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const walletAddress = signer.address; // Updated for ethers.js v6

      // Validate the network
      const network = await provider.getNetwork();
      if (parseInt(network.chainId) !== parseInt(CHAIN_ID)) {
        try {
          // Attempt to switch network
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${parseInt(CHAIN_ID).toString(16)}` }],
          });
        } catch (error) {
          if (error.code === 4902) {
            // Network not found in Metamask, add the network
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${parseInt(CHAIN_ID).toString(16)}`,
                  chainName: CHAIN_NAME,
                  rpcUrls: [RPC_URL],
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io/"],
                },
              ],
            });

            // Switch to the newly added network
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${parseInt(CHAIN_ID).toString(16)}` }],
            });
          } else {
            console.error("Error switching network:", error);
            alert("Failed to switch network. Please try again.");
            return;
          }
        }
      }

      // Fetch ETH balance
      const ethBalance = await provider.getBalance(walletAddress);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);

      // Fetch DAI details
      const daiContract = new ethers.Contract(
        DAI_CONTRACT_ADDRESS,
        daiAbi,
        provider
      );
      const daiBalance = await daiContract.balanceOf(walletAddress);
      const decimals = await daiContract.decimals();
      const daiBalanceFormatted = ethers.formatUnits(daiBalance, decimals);

      // Fetch token name dynamically
      const tokenName = await daiContract.name();

      // Add DAI to wallet if not added
      //   try {
      //     await window.ethereum.request({
      //       method: "wallet_watchAsset",
      //       params: {
      //         type: "ERC20",
      //         options: {
      //           address: DAI_CONTRACT_ADDRESS,
      //           symbol: tokenName,
      //           decimals: decimals,
      //         },
      //       },
      //     });
      //     console.log("DAI added to wallet successfully!");
      //   } catch (error) {
      //     console.error("Error adding DAI to wallet:", error);
      //     alert("Failed to add DAI to your wallet. Please try again.");
      //   }

      // Update state
      setWalletAddress(walletAddress);
      setEthBalance(ethBalanceFormatted);
      setDaiBalance(daiBalanceFormatted);
      setDaiTokenName(tokenName);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false); // Stop loader
    }
  };

  return (
    <div>
      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <p>ETH Balance: {ethBalance} ETH</p>
          <p>
            {daiTokenName} Balance: {daiBalance} {daiTokenName}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
