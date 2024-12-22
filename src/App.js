import React, { useState } from 'react';
// import WalletConnector  from './components/WalletConnector';
import WalletConnector from './components/WalletConnector';
import SendTab from './components/SendTab';
import ReceiveTab from './components/ReceiveTab';

function App() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="App">
      <header>
        <h1>Fund Movement MVP</h1>
        <WalletConnector />
      </header>
      <main>
        <nav>
          <button onClick={() => setActiveTab('send')}>Send</button>
          <button onClick={() => setActiveTab('receive')}>Receive</button>
        </nav>
        <section>
          {activeTab === 'send' ? <SendTab /> : <ReceiveTab />}
        </section>
      </main>
    </div>
  );
}

export default App;