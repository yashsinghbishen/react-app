import React, { useState } from "react";
import { ethers } from "ethers";
import { Transak } from "@transak/transak-sdk";

const SendTab = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const DAI_CONTRACT_ADDRESS = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;

  const daiAbi = [
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  const validateInputs = () => {
    if (!ethers.isAddress(receiverAddress)) {
      setMessage("Invalid receiver address.");
      return false;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage("Invalid amount. Must be a positive number.");
      return false;
    }
    return true;
  };

  const handleTransakOnRamp = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setMessage("Launching Transak widget...");
    console.log(1);
    const transak = new Transak({
      apiKey: process.env.REACT_APP_TRANSAK_API_KEY,
      environment: Transak.ENVIRONMENTS.STAGING, // Change to "production" for live
      network: "base",
      productsAvailed: "BUY",
      cryptoCurrencyCode: "USDC",
      walletAddress: await getConnectedWalletAddress(),
      defaultCryptoAmount: amount, // Amount in fiat
      themeColor: "000000",
    });
    console.log(1);

    await transak.init();

    console.log(1);
    // Listen for all events
    Transak.on("*", (data) => {
      console.log("Event received:", data);
    });
    console.log(1);
    // Handle widget close event
    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      console.log("Transak widget closed!");
    });

    console.log(1);

    // Handle order creation event
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData) => {
      console.log("Order created:", orderData);
    });
    console.log(1);

    // Handle successful order event
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, async (orderData) => {
      console.log("Order successful:", orderData);
      await transak.close(); // Close the widget after successful order
      await sendDaiTransaction();
    });
    console.log(1);

  };

  const getConnectedWalletAddress = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return signer.address;
  };

  const sendDaiTransaction = async () => {
    try {
      setIsLoading(true);
      setMessage("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = provider.getSigner();

      const daiContract = new ethers.Contract(
        DAI_CONTRACT_ADDRESS,
        daiAbi,
        signer
      );
      const decimals = await daiContract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);

      const tx = await daiContract.transfer(receiverAddress, amountInWei);
      await tx.wait();

      setMessage("Transaction successful!");
    } catch (error) {
      console.error("\n\n\nTransaction error in raw:", error);
      setMessage("Transaction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Send DAI</h2>
      <div>
        <label>
          Receiver Address:
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="0x..."
          />
        </label>
      </div>
      <div>
        <label>
          Amount (DAI):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </label>
      </div>
      <button onClick={handleTransakOnRamp} disabled={isLoading}>
        {isLoading ? "Processing..." : "Send DAI"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendTab;
