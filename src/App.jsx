import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeContext";
import ConnectWallet from "./components/ConnectWallet";
import MiningSection from "./components/MiningSection";
import NFTGallery from "./components/NFTGallery";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // New state for refresh
  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!account ? (
            <ConnectWallet setAccount={setAccount} setProvider={setProvider} />
          ) : (
            <>
              <MiningSection
                provider={provider}
                account={account}
                onMintSuccess={() => setRefreshTrigger((prev) => prev + 1)} // Proper callback
              />
              <NFTGallery provider={provider} account={account} />
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
