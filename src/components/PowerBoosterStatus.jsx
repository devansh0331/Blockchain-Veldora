import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { LightningBoltIcon } from "./Icons";

export default function PowerBoosterStatus({
  provider,
  account,
  darkMode,
  stakedNFTs,
}) {
  const [boost, setBoost] = useState({
    active: false,
    expires: 0,
    multiplier: 100,
  });
  const [timeLeft, setTimeLeft] = useState("");

  // Contract setup
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function activeBoosts(address) view returns (uint256 multiplier, uint256 expires)",
    "event BoostActivated(address indexed user, uint256 multiplier, uint256 duration)",
  ];

  // Calculate boosted rates
  const calculateRates = useCallback(() => {
    const baseHourly = stakedNFTs.reduce((total, nft) => {
      return total + [10, 20, 50, 100][nft.rarityLevel];
    }, 0);

    const boostedHourly = boost.active
      ? Math.floor((baseHourly * boost.multiplier) / 100)
      : baseHourly;

    return {
      hourly: boostedHourly,
      daily: boostedHourly * 24,
    };
  }, [stakedNFTs, boost]);

  const rates = calculateRates();

  // Fetch boost status
  const fetchBoostStatus = useCallback(async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      const { multiplier, expires } = await contract.activeBoosts(account);
      setBoost({
        active: expires.toNumber() > Math.floor(Date.now() / 1000),
        expires: expires.toNumber(),
        multiplier: multiplier.toNumber(),
      });
    } catch (error) {
      console.error("Error fetching boost:", error);
    }
  }, [provider, account]);

  // Update countdown timer
  useEffect(() => {
    if (!boost.expires) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = boost.expires - now;

      if (diff <= 0) {
        setBoost((prev) => ({ ...prev, active: false }));
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second
    return () => clearInterval(interval);
  }, [boost.expires]);

  // Initial fetch and event listeners
  useEffect(() => {
    if (!provider) return;

    fetchBoostStatus();
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    contract.on("BoostActivated", fetchBoostStatus);
    return () => contract.off("BoostActivated", fetchBoostStatus);
  }, [provider, account, fetchBoostStatus]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden p-5 rounded-xl border ${
        boost.active
          ? darkMode
            ? "border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-gray-800/50"
            : "border-emerald-400/50 bg-gradient-to-br from-emerald-50 to-white"
          : darkMode
          ? "border-gray-600 bg-gray-800/50"
          : "border-gray-200 bg-gray-50"
      } shadow-lg transition-all duration-300`}
    >
      {/* Glow effect when active */}
      {boost.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={
                boost.active
                  ? {
                      scale: [1, 1.1, 1],
                      transition: { duration: 2, repeat: Infinity },
                    }
                  : {}
              }
            >
              <LightningBoltIcon
                className={`w-7 h-7 ${
                  boost.active
                    ? "text-veldora-gold drop-shadow-[0_0_8px_rgba(110,231,183,0.6)]"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              />
            </motion.div>

            <div>
              <h3
                className={`font-semibold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Power Booster
              </h3>
              <p
                className={`text-sm ${
                  boost.active
                    ? darkMode
                      ? "text-gray-300"
                      : "text-emerald-600"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {boost.active
                  ? `Active • ${timeLeft} remaining`
                  : "Ready to activate"}
              </p>
            </div>
          </div>

          {boost.active && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                darkMode
                  ? "bg-emerald-900/50 text-veldora-gold border border-veldora-darkpurple"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              +{boost.multiplier - 100}%
            </motion.div>
          )}
        </div>

        {/* Boost impact visualization */}
        <div
          className={`mt-4 grid grid-cols-2 gap-3 ${
            boost.active ? "opacity-100" : "opacity-70"
          } transition-opacity`}
        >
          <div
            className={`p-3 rounded-lg ${
              darkMode ? "bg-gray-700/30" : "bg-gray-100/70"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Points/Hour
            </p>
            <p
              className={`text-lg font-bold ${
                boost.active
                  ? darkMode
                    ? "text-veldora-gold"
                    : "text-emerald-600"
                  : darkMode
                  ? "text-veldora-gold"
                  : "text-gray-700"
              }`}
            >
              {rates.hourly.toLocaleString()}
            </p>
          </div>

          <div
            className={`p-3 rounded-lg ${
              darkMode ? "bg-gray-700/30" : "bg-gray-100/70"
            }`}
          >
            <p
              className={`text-xs ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Estimated Daily
            </p>
            <p
              className={`text-lg font-bold ${
                boost.active
                  ? darkMode
                    ? "text-veldora-gold"
                    : "text-emerald-600"
                  : darkMode
                  ? "text-veldora-gold"
                  : "text-gray-700"
              }`}
            >
              {rates.daily.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
