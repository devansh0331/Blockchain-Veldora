import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import MiningSection from "./components/MiningSection";
import NFTGallery from "./components/NFTGallery";
import StakingSection from "./components/StakingSection";
import StakedNFTGallery from "./components/StakedNFTGallery";
import ShopSection from "./components/ShopSection";
import InventoryPanel from "./components/InventoryPanel";
import PointsBalance from "./components/PointsBalance";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import Navbar from "./components/Navbar";
import About from "./components/About";
import DashboardSection from "./components/DashboardSection";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh data when account changes
  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [account]);

  return (
    <ThemeProvider>
      <Navbar
        account={account}
        setAccount={setAccount}
        setProvider={setProvider}
      />
      <main className="min-h-screen pt-16 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/mine"
              element={
                <>
                  <MiningSection
                    provider={provider}
                    account={account}
                    onMintSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                  <NFTGallery
                    provider={provider}
                    account={account}
                    key={`nft-gallery-${refreshTrigger}`}
                  />
                </>
              }
            />
            <Route
              path="/stake"
              element={
                <>
                  <StakingSection
                    provider={provider}
                    account={account}
                    onStakeChange={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                  <StakedNFTGallery
                    provider={provider}
                    account={account}
                    key={`staked-gallery-${refreshTrigger}`}
                  />
                  <PointsBalance provider={provider} account={account} />
                  {/* <InventoryPanel provider={provider} account={account} /> */}
                </>
              }
            />
            <Route
              path="/shop"
              element={
                <>
                  <PointsBalance provider={provider} account={account} />
                  <ShopSection
                    provider={provider}
                    account={account}
                    onPurchase={() => setRefreshTrigger((prev) => prev + 1)}
                  />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <About />
                </>
              }
            />
            <Route
              path="/dashboard"
              element={
                <DashboardSection provider={provider} account={account} />
              }
            />
            <Route
              path="/"
              element={
                <ConnectWallet
                  setAccount={setAccount}
                  setProvider={setProvider}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
