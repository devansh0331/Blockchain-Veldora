import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import { ShieldCheckIcon, ClockIcon, SparklesIcon, WalletIcon } from "./Icons";

const rarityStyles = {
  Common: {
    bg: "bg-gray-100 dark:bg-gray-700",
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-800 dark:text-gray-200",
    icon: "⭐",
  },
  Rare: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-800 dark:text-blue-200",
    icon: "✨",
  },
  Epic: {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-800 dark:text-purple-200",
    icon: "💎",
  },
  Legendary: {
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30",
    border: "border-yellow-300 dark:border-yellow-600",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: "🔥",
  },
};

export default function StakedNFTGallery({ provider, account }) {
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeStaked, setTimeStaked] = useState({});
  const { darkMode } = useTheme();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenRarity(uint256 tokenId) view returns (uint256)",
    "function stakingStartTime(uint256 tokenId) view returns (uint256)",
    "function getStakedTokens(address owner) view returns (uint256[] memory)",
    "event Staked(address indexed owner, uint256 indexed tokenId)",
    "event Unstaked(address indexed owner, uint256 indexed tokenId)",
  ];

  const fetchStakedNFTs = async () => {
    if (!provider || !account) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      // 1. Get staked tokens (no gas limit needed for view functions)
      const stakedTokenIds = await contract.getStakedTokens(account);
      console.log(
        "Staked token IDs:",
        stakedTokenIds.map((id) => id.toString())
      );

      // 2. Process tokens with optimized calls
      const verifiedNFTs = await Promise.all(
        stakedTokenIds.map(async (tokenIdBigNum) => {
          const tokenId = tokenIdBigNum.toNumber();
          try {
            // 2.1. Verify ownership
            const owner = await contract.ownerOf(tokenId);
            const isStaked = owner.toLowerCase() === account.toLowerCase();
            if (!isStaked) return null;

            // 2.2. Use multicall or batch requests if available
            const [rarity, startTime] = await Promise.all([
              // Fallback to 0 if call fails
              contract
                .tokenRarity(tokenId)
                .catch(() => ethers.BigNumber.from(0)),
              contract
                .stakingStartTime(tokenId)
                .catch(() => ethers.BigNumber.from(0)),
            ]);

            return {
              id: tokenId,
              rarity: ["Common", "Rare", "Epic", "Legendary"][
                rarity.toNumber()
              ],
              rarityLevel: rarity.toNumber(),
              startTime: startTime.toNumber(),
            };
          } catch (error) {
            console.warn(`Skipping token ${tokenId}:`, error.message);
            return null;
          }
        })
      );

      // Filter out null values and set state
      const validNFTs = verifiedNFTs.filter((nft) => nft !== null);
      setStakedNFTs(validNFTs);

      // Update staking times
      const currentTime = Math.floor(Date.now() / 1000);
      const newTimeStaked = {};
      validNFTs.forEach((nft) => {
        newTimeStaked[nft.id] = currentTime - nft.startTime;
      });
      setTimeStaked(newTimeStaked);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stakedNFTs.length === 0) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const updatedTimes = { ...timeStaked };
      let needsUpdate = false;

      stakedNFTs.forEach((nft) => {
        const newDuration = currentTime - nft.startTime;
        if (newDuration !== timeStaked[nft.id]) {
          updatedTimes[nft.id] = newDuration;
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        setTimeStaked(updatedTimes);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [stakedNFTs, timeStaked]);

  useEffect(() => {
    if (!provider || !account) {
      setLoading(false);
      return;
    }

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    const onStakeEvent = () => fetchStakedNFTs();
    const onUnstakeEvent = () => fetchStakedNFTs();

    const stakeFilter = contract.filters.Staked(account);
    const unstakeFilter = contract.filters.Unstaked(account);

    contract.on(stakeFilter, onStakeEvent);
    contract.on(unstakeFilter, onUnstakeEvent);

    fetchStakedNFTs();

    return () => {
      contract.off(stakeFilter, onStakeEvent);
      contract.off(unstakeFilter, onUnstakeEvent);
    };
  }, [provider, account]);

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

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 text-center mb-12 ${
          darkMode ? "bg-gray-800/50" : "bg-white/50"
        } backdrop-blur-sm border ${
          darkMode ? "border-veldora-gold" : "border-gray-200"
        }`}
      >
        <WalletIcon
          className={`mx-auto w-12 h-12 mb-4 ${
            darkMode ? "text-veldora-gold" : "text-gray-500"
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
          Please connect your wallet to view staked NFTs
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-16"
    >
      <div className="flex justify-between items-center mb-6 ">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Your Staked NFTs
        </h2>
        {account && (
          <div
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Connected: {`${account.slice(0, 6)}...${account.slice(-4)}`}
          </div>
        )}
      </div>

      {stakedNFTs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-xl p-8 text-center ${
            darkMode ? "bg-gray-800/50" : "bg-white/50"
          } backdrop-blur-sm border ${
            darkMode ? "border-veldora-gold" : "border-gray-200"
          }`}
        >
          <ShieldCheckIcon
            className={`mx-auto w-12 h-12 mb-4 ${
              darkMode ? "text-veldora-gold" : "text-gray-500"
            }`}
          />
          <h3
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No NFTs Currently Staked
          </h3>
          <p
            className={`mt-2 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Stake your NFTs to start earning rewards
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stakedNFTs.map((nft) => {
            const style = rarityStyles[nft.rarity];
            const duration = formatDuration(timeStaked[nft.id] || 0);

            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className={`${style.bg} ${style.border} rounded-xl overflow-hidden shadow-lg transition-all duration-300 border-2 relative`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`${style.text} font-bold text-lg`}>
                        NFT #{nft.id}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? "bg-gray-600/50 text-gray-200"
                            : "bg-white/70 text-gray-700"
                        }`}
                      >
                        {nft.rarity}
                      </span>
                    </div>
                    <span className="text-2xl">{style.icon}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <ClockIcon
                        className={`w-4 h-4 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Staked for: {duration}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <SparklesIcon
                        className={`w-4 h-4 ${
                          darkMode
                            ? "text-veldora-gold"
                            : "text-veldora-darkgold"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          darkMode
                            ? "text-veldora-gold"
                            : "text-veldora-darkgold"
                        }`}
                      >
                        Earning {[10, 20, 50, 100][nft.rarityLevel]} pts/hr
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
