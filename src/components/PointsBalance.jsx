import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import { SparklesIcon, WalletIcon } from "./Icons";

export default function PointsBalance({ provider, account }) {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useTheme();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function stakingPoints(address) view returns (uint256)",
    "event PointsEarned(address indexed user, uint256 amount)",
    "event ItemPurchased(address indexed buyer, uint256 itemId, uint256 quantity)",
  ];

  const fetchPoints = async () => {
    if (!provider || !account) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      const userPoints = await contract.stakingPoints(account);
      setPoints(ethers.utils.formatUnits(userPoints, 0));
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!provider || !account) {
      setIsLoading(false);
      return;
    }

    fetchPoints();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    // Listen for both points earned and item purchased events
    const pointsFilter = contract.filters.PointsEarned(account);
    const purchaseFilter = contract.filters.ItemPurchased(account);

    contract.on(pointsFilter, fetchPoints);
    contract.on(purchaseFilter, fetchPoints);

    return () => {
      contract.off(pointsFilter, fetchPoints);
      contract.off(purchaseFilter, fetchPoints);
    };
  }, [provider, account]);

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 text-center mb-12 ${
          darkMode ? "bg-gray-800/50" : "bg-white/50"
        } backdrop-blur-sm border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <WalletIcon
          className={`mx-auto w-12 h-12 mb-4 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        />
        <h3
          className={`text-lg font-medium ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Wallet Not Connected
        </h3>
        <p
          className={`mt-2 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Connect your wallet to view{" "}
          <span className="text-veldora-gold">staking points</span>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 p-6 rounded-xl shadow-lg ${
        darkMode ? "bg-gray-800/80" : "bg-white/80"
      } backdrop-blur-sm border ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your Staking Points
            </h3>
            {account && (
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {`${account.slice(0, 4)}...${account.slice(-4)}`}
              </span>
            )}
          </div>
          {isLoading ? (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-8 w-32 mt-2 rounded bg-gray-300 dark:bg-gray-600"
            />
          ) : (
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              key={points}
              className={`text-3xl font-bold ${
                darkMode ? "text-veldora-gold" : "text-veldora-darkgold"
              }`}
            >
              {points.toLocaleString()}
            </motion.p>
          )}
        </div>

        <div
          className={`p-3 rounded-full ${
            darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
          }`}
        >
          <SparklesIcon
            className={`w-8 h-8 ${
              darkMode ? "text-veldora-gold" : "text-veldora-darkgold"
            }`}
          />
        </div>
      </div>

      {account && !isLoading && (
        <>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (points / 10000) * 100)}%` }}
            transition={{ duration: 1, type: "spring" }}
            className={`mt-4 h-2 rounded-full ${
              darkMode
                ? "bg-gradient-to-r from-veldora-gold to-veldora-darkgold"
                : "bg-gradient-to-r from-veldora-darkgold to-veldora-gold"
            }`}
          />

          <p
            className={`mt-2 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Earn more points by staking your NFTs
          </p>
        </>
      )}
    </motion.div>
  );
}
