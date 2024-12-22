return (
    <div>
      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : !walletAddress ? (
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