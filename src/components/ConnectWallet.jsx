import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { WalletIcon, ArrowRightIcon, ShieldIcon, AwardIcon } from "./Icons";
import { ethers } from "ethers";
import { useEffect } from "react";

export default function ConnectWallet({ setAccount, setProvider }) {
  const { darkMode } = useTheme();
  const connectWallet = async () => {
    if (window.ethereum) {
      // Standard connection (desktop/mobile in-app browser)
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setAccount(accounts[0]);
      setProvider(provider);
    } else {
      window.open("https://metamask.io/download.html", "_blank");
    }
  };

  // Helper: Detect MetaMask connection after mobile redirect
  const listenForMobileConnection = () => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setAccount(accounts[0]);
          setProvider(provider);
        } catch (error) {
          console.error("Mobile connection failed:", error);
        }
      } else {
        // Retry after 1 second (MetaMask might take time to inject `window.ethereum`)
        setTimeout(checkConnection, 1000);
      }
    };

    checkConnection(); // Start polling
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        <div className="mb-12">
          <motion.h1
            className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${
              darkMode
                ? "from-blue-400 to-purple-500"
                : "from-blue-600 to-purple-700"
            } bg-clip-text text-transparent`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Discover Veldora
          </motion.h1>
          <motion.p
            className={`text-xl mb-8 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } max-w-2xl mx-auto`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Connect your wallet to start minting unique NFTs on Veldora
          </motion.p>
        </div>

        {/* Animated Wallet Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className={`p-8 rounded-2xl shadow-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } max-w-md mx-auto mb-12`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`p-4 rounded-full ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              } mb-6`}
            >
              <WalletIcon
                className={`w-10 h-10 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <motion.button
              onClick={connectWallet}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-8 py-4 text-lg font-semibold rounded-full flex items-center space-x-2 ${
                darkMode
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
              } text-white shadow-lg`}
            >
              <span>Connect Wallet</span>
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: (
                <AwardIcon
                  className={`w-8 h-8 ${
                    darkMode ? "text-yellow-400" : "text-yellow-500"
                  }`}
                />
              ),
              title: "Unique Rarities",
              description:
                "Mint NFTs with different rarity levels from Common to Legendary",
            },
            {
              icon: (
                <ShieldIcon
                  className={`w-8 h-8 ${
                    darkMode ? "text-green-400" : "text-green-500"
                  }`}
                />
              ),
              title: "Secure",
              description:
                "Your assets are protected with blockchain technology",
            },
            {
              icon: (
                <div
                  className={`text-3xl ${
                    darkMode ? "text-purple-400" : "text-purple-500"
                  }`}
                >
                  ✨
                </div>
              ),
              title: "Easy to start",
              description: "Just connect your wallet and click 'Mint NFT'",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              } flex flex-col items-center text-center`}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {feature.title}
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          className={`mt-12 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Start your Veldora journey today.{" "}
          <a
            href="https://metamask.io/download.html"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Install MetaMask
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
