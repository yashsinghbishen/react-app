import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
// import TransakSDK from "@transak/transak-sdk";

const ReceiveTab = () => {
  const [daiBalance, setDaiBalance] = useState(null);
  const [message, setMessage] = useState("");

  const DAI_CONTRACT_ADDRESS = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;

  const daiAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const fetchDaiBalance = async () => {
    try {
      if (!window.ethereum) {
        alert("Metamask is not installed!");
        return;
      }

const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      const daiContract = new ethers.Contract(DAI_CONTRACT_ADDRESS, daiAbi, provider);
      const decimals = await daiContract.decimals();
      const balance = await daiContract.balanceOf(walletAddress);
      const formattedBalance = ethers.formatUnits(balance, decimals);

      setDaiBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching DAI balance:", error);
      setMessage("Failed to fetch DAI balance.");
    }
  };

  const handleTransakOffRamp = async () => {
    try {
const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

    //   const transak = new TransakSDK({
    //     apiKey: process.env.REACT_APP_TRANSAK_API_KEY,
    //     environment: "staging", // Change to "production" for live
    //     defaultCryptoCurrency: "DAI",
    //     walletAddress: walletAddress,
    //     fiatAmount: daiBalance, // DAI balance as the off-ramp amount
    //     themeColor: "000000",
    //   });

    //   transak.init();

    //   transak.on("offRampTransactionSuccess", () => {
    //     transak.close();
    //     setMessage("OffRamp transaction successful!");
    //   });

    //   transak.on("offRampTransactionFailed", () => {
    //     transak.close();
    //     setMessage("OffRamp transaction failed.");
    //   });
    } catch (error) {
      console.error("Error with Transak OffRamp:", error);
      setMessage("Failed to initiate OffRamp transaction.");
    }
  };

  useEffect(() => {
    fetchDaiBalance();
  }, []);

  return (
    <div>
      <h2>Receive Funds</h2>
      <div>
        <p>Total Funds (DAI): {daiBalance !== null ? `${daiBalance} DAI` : "Loading..."}</p>
      </div>
      <button onClick={handleTransakOffRamp} disabled={!daiBalance}>
        Get in Fiat
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ReceiveTab;