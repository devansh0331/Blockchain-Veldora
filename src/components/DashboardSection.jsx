import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import {
  SparklesIcon,
  ClockIcon,
  ArrowPathIcon,
  CubeIcon,
  LightningBoltIcon,
  GiftIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "./Icons";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import PowerBoosterStatus from "./PowerBoosterStatus";

export default function DashboardSection({ provider, account }) {
  const { darkMode } = useTheme();
  const [points, setPoints] = useState(0);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [ownedItems, setOwnedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [timeStaked, setTimeStaked] = useState({});
  const [chartData, setChartData] = useState(null);
  const [isBoostActive, setIsBoostActive] = useState(false);

  // Contract configuration
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function stakingPoints(address) view returns (uint256)",
    "function getStakedTokens(address) view returns (uint256[])",
    "function tokenRarity(uint256) view returns (uint256)",
    "function stakingStartTime(uint256) view returns (uint256)",
    "function ownedItems(address, uint256) view returns (uint256)",
    "function upgradeNFT(uint256) external",
    "function calculatePoints(uint256) view returns (uint256)",
    "event PointsEarned(address indexed user, uint256 amount)",
    "event Staked(address indexed owner, uint256 indexed tokenId)",
    "event Unstaked(address indexed owner, uint256 indexed tokenId)",
    "event NFTUpgraded(address indexed owner, uint256 indexed tokenId, uint256 newRarity)",
  ];

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
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

      // Fetch points balance
      const pointsBalance = await contract.stakingPoints(account);
      setPoints(pointsBalance.toNumber());
      console.log("Hello");

      // Fetch staked NFTs
      const stakedTokenIds = await contract.getStakedTokens(account);
      const nfts = await Promise.all(
        stakedTokenIds.map(async (tokenId) => {
          const rarity = await contract
            .tokenRarity(tokenId)
            .catch(() => ethers.BigNumber.from(0));
          const startTime = await contract
            .stakingStartTime(tokenId)
            .catch(() => ethers.BigNumber.from(0));
          const pendingPoints = await contract
            .calculatePoints(tokenId)
            .catch(() => ethers.BigNumber.from(0));

          return {
            id: tokenId.toNumber(),
            rarity: ["Common", "Rare", "Epic", "Legendary"][rarity],
            rarityLevel: rarity,
            startTime: startTime.toNumber(),
            pendingPoints: pendingPoints.toNumber(),
          };
        })
      );

      setStakedNFTs(nfts);

      // Update staking times
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimeStaked = {};
      nfts.forEach((nft) => {
        newTimeStaked[nft.id] = currentTime - nft.startTime;
      });
      setTimeStaked(newTimeStaked);

      // Fetch owned items
      const items = await Promise.all(
        [1, 2, 3, 4].map(async (itemId) => ({
          id: itemId,
          quantity: (await contract.ownedItems(account, itemId)).toNumber(),
        }))
      );
      const ownedMap = items.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setOwnedItems(ownedMap);

      // Update points history for chart
      setPointsHistory((prev) => {
        const newHistory = [...prev, pointsBalance.toNumber()].slice(-24); // Keep last 24 entries
        return newHistory;
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      showStatusMessage("Failed to load dashboard data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [provider, account]);

  // Initialize chart data
  useEffect(() => {
    if (pointsHistory.length > 0) {
      const labels = pointsHistory.map((_, i) => `${i + 1}h ago`).reverse();
      const data = [...pointsHistory].reverse();

      setChartData({
        labels,
        datasets: [
          {
            label: "Points Growth",
            data,
            borderColor: darkMode ? "#FBBF24" : "#D97706",
            backgroundColor: darkMode
              ? "rgba(251, 191, 36, 0.1)"
              : "rgba(217, 119, 6, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    }
  }, [pointsHistory, darkMode]);

  // Status message handler
  const showStatusMessage = (text, status = "processing") => {
    setStatusMessage({ text, status });
    if (status !== "processing") {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      mins > 0 ? `${mins}m` : null,
      `${secs}s`,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // Calculate total points per hour
  const calculateHourlyPoints = () => {
    return stakedNFTs.reduce((total, nft) => {
      const rate = [10, 20, 50, 100][nft.rarityLevel];
      return total + rate; // Points per hour
    }, 0);
  };

  // Upgrade NFT rarity
  const upgradeNFT = async (tokenId) => {
    if (!provider || !account) {
      showStatusMessage("Please connect your wallet", "error");
      return;
    }

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      showStatusMessage("Upgrading NFT...", "processing");
      const tx = await contract.upgradeNFT(tokenId, { gasLimit: 300000 });
      await tx.wait();
      showStatusMessage("NFT upgraded successfully!", "success");
      fetchDashboardData();
    } catch (error) {
      console.error("Upgrade failed:", error);
      let errorMsg = "Upgrade failed";
      if (error.code === 4001) errorMsg = "Transaction rejected";
      showStatusMessage(errorMsg, "error");
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (!provider || !account) return;

    fetchDashboardData();

    // Set up interval for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds

    // Listen for contract events
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const pointsFilter = contract.filters.PointsEarned(account);
    const stakeFilter = contract.filters.Staked(account);
    const unstakeFilter = contract.filters.Unstaked(account);
    const upgradeFilter = contract.filters.NFTUpgraded(account);

    contract.on(pointsFilter, fetchDashboardData);
    contract.on(stakeFilter, fetchDashboardData);
    contract.on(unstakeFilter, fetchDashboardData);
    contract.on(upgradeFilter, fetchDashboardData);

    return () => {
      clearInterval(interval);
      contract.off(pointsFilter, fetchDashboardData);
      contract.off(stakeFilter, fetchDashboardData);
      contract.off(unstakeFilter, fetchDashboardData);
      contract.off(upgradeFilter, fetchDashboardData);
    };
  }, [provider, account, fetchDashboardData]);

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
        <SparklesIcon
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
          Connect your wallet to view your staking dashboard
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center min-w-[300px] ${
              statusMessage.status === "error"
                ? "bg-red-500 text-white"
                : statusMessage.status === "success"
                ? "bg-green-500 text-white"
                : "bg-veldora-purple text-white"
            }`}
          >
            {statusMessage.status === "error" ? (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : statusMessage.status === "success" ? (
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800/80" : "bg-white/80"
        } backdrop-blur-sm border ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Staking Dashboard
            </h2>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } mt-1`}
            >
              Track your rewards and manage your staked NFTs
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Current Balance
              </p>
              <motion.p
                key={points}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-3xl font-bold ${
                  darkMode ? "text-veldora-gold" : "text-veldora-darkgold"
                }`}
              >
                {points.toLocaleString()}
              </motion.p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-br from-veldora-gold to-veldora-darkgold">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-veldora-gold/10">
                <ClockIcon className="w-5 h-5 text-veldora-gold" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Staked NFTs
                </p>
                <p
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {stakedNFTs.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-veldora-purple/10">
                <ChartBarIcon className="w-5 h-5 text-veldora-purple" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Points Per Hour
                </p>
                <p
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {calculateHourlyPoints().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-veldora-blue/10">
                <InformationCircleIcon className="w-5 h-5 text-veldora-blue" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Estimated Daily
                </p>
                <p
                  className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {(calculateHourlyPoints() * 24).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* <motion.div
        className={`p-6 rounded-xl border-2 ${
          isBoostActive
            ? darkMode
              ? "border-emerald-500 bg-gradient-to-br from-gray-800 to-gray-900"
              : "border-emerald-400 bg-gradient-to-br from-white to-gray-50"
            : darkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        } shadow-lg transition-all duration-500`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Current Points
            </h3>
            <motion.p
              key={`${points}-${isBoostActive}`}
              initial={{ scale: 1 }}
              animate={{
                scale: isBoostActive ? [1, 1.05, 1] : 1,
                color: isBoostActive
                  ? darkMode
                    ? "#6EE7B7" // emerald-400
                    : "#059669" // emerald-600
                  : darkMode
                  ? "#FBBF24" // amber-400
                  : "#D97706", // amber-600
              }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold"
            >
              {points.toLocaleString()}
              {isBoostActive && (
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-2 text-sm"
                >
                  (+20%)
                </motion.span>
              )}
            </motion.p>
          </div>
          {isBoostActive && (
            <motion.div
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <SparklesIcon className="w-8 h-8 text-emerald-500" />
            </motion.div>
          )}
        </div>
      </motion.div> */}

      {/* Power Booster Status Card */}
      <PowerBoosterStatus
        provider={provider}
        account={account}
        darkMode={darkMode}
        stakedNFTs={stakedNFTs}
      />

      {/* Points Growth Chart */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl shadow-lg ${
            darkMode ? "bg-gray-800/80" : "bg-white/80"
          } backdrop-blur-sm border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Points Growth (Last 24 Hours)
          </h3>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: darkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: darkMode ? "#9CA3AF" : "#6B7280",
                    },
                  },
                  y: {
                    grid: {
                      color: darkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)",
                    },
                    ticks: {
                      color: darkMode ? "#9CA3AF" : "#6B7280",
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Staked NFTs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staked NFTs List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-xl shadow-lg ${
              darkMode ? "bg-gray-800/80" : "bg-white/80"
            } backdrop-blur-sm border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Your Staked NFTs
              </h3>
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {stakedNFTs.length === 0 ? (
              <div
                className={`p-8 text-center rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                }`}
              >
                <p
                  className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  No NFTs currently staked
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stakedNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                    } border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          NFT #{nft.id}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              darkMode
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {nft.rarity}
                          </span>
                          <span
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formatDuration(timeStaked[nft.id] || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Pending Points
                        </p>
                        <p
                          className={`font-bold ${
                            darkMode
                              ? "text-veldora-gold"
                              : "text-veldora-darkgold"
                          }`}
                        >
                          {nft.pendingPoints.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {nft.rarity !== "Legendary" && ownedItems[2] > 0 && (
                      <button
                        onClick={() => upgradeNFT(nft.id)}
                        className={`mt-3 w-full py-2 text-sm rounded-lg ${
                          darkMode
                            ? "bg-veldora-purple/20 text-veldora-gold hover:bg-veldora-purple/30"
                            : "bg-veldora-darkpurple/10 text-veldora-darkgold hover:bg-veldora-darkpurple/20"
                        } transition-colors`}
                      >
                        Upgrade Rarity (Cost: 1 Catalyst)
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Available Items Section */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-xl shadow-lg ${
              darkMode ? "bg-gray-800/80" : "bg-white/80"
            } backdrop-blur-sm border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Available Items
            </h3>

            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-veldora-gold/10">
                    <LightningBoltIcon className="w-5 h-5 text-veldora-gold" />
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Power Booster
                    </h4>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      +20% staking rewards for 24h
                    </p>
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ownedItems[1] || 0}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-veldora-purple/10">
                    <GiftIcon className="w-5 h-5 text-veldora-purple" />
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Rarity Catalyst
                    </h4>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Upgrade NFT rarity
                    </p>
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ownedItems[2] || 0}
                </span>
              </div>

              <div
                className={`p-3 rounded-lg flex items-center justify-between ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-veldora-blue/10">
                    <CubeIcon className="w-5 h-5 text-veldora-blue" />
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Mining Accelerator
                    </h4>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      +10% instant points
                    </p>
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {ownedItems[3] || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
