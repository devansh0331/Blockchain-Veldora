import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import { ShieldCheckIcon, SparklesIcon, ClockIcon } from "./Icons";

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
    bg: "bg-purple-50 dark:bg-veldoraple-900/30",
    border: "border-veldoraple-300 dark:border-veldoraple-600",
    text: "text-veldoraple-800 dark:text-veldoraple-200",
    icon: "💎",
  },
  Legendary: {
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30",
    border: "border-yellow-300 dark:border-yellow-600",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: "🔥",
  },
};

export default function InventoryPanel({
  provider,
  account,
  onStakeSuccess,
  onUnstakeSuccess,
}) {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("staked");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeStaked, setTimeStaked] = useState({});

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function getStakedTokens(address) view returns (uint256[])",
    "function getOwnedTokens(address) view returns (uint256[])",
    "function tokenRarity(uint256) view returns (uint256)",
    "function stakingStartTime(uint256) view returns (uint256)",
    "function stake(uint256) external",
    "function unstake(uint256) external",
    "event Staked(address indexed owner, uint256 indexed tokenId)",
    "event Unstaked(address indexed owner, uint256 indexed tokenId)",
  ];

  const fetchNFTs = async () => {
    if (!provider || !account) return;

    setLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      const tokenIds =
        activeTab === "staked"
          ? await contract.getStakedTokens(account)
          : await contract.getStakedTokens(account);

      const nftDetails = await Promise.all(
        tokenIds.map(async (tokenIdBigNum) => {
          const tokenId = tokenIdBigNum.toNumber();
          try {
            const [rarity, startTime] = await Promise.all([
              contract.tokenRarity(tokenId),
              activeTab === "staked"
                ? contract.stakingStartTime(tokenId)
                : Promise.resolve(0),
            ]);

            return {
              id: tokenId,
              rarity: ["Common", "Rare", "Epic", "Legendary"][
                rarity.toNumber()
              ],
              startTime: startTime.toNumber(),
            };
          } catch (error) {
            console.warn(`Error processing token ${tokenId}:`, error);
            return null;
          }
        })
      );

      setNfts(nftDetails.filter((nft) => nft !== null));
      updateStakingTimes(nftDetails);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStakingTimes = (nfts) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const newTimes = {};
    nfts
      .filter((nft) => nft)
      .forEach((nft) => {
        if (activeTab === "staked" && nft.startTime) {
          newTimes[nft.id] = currentTime - nft.startTime;
        }
      });
    setTimeStaked(newTimes);
  };

  const handleStake = async (tokenId) => {
    if (!provider || !account) return;

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.stake(tokenId, { gasLimit: 300000 });
      await tx.wait();
      if (onStakeSuccess) onStakeSuccess();
      fetchNFTs();
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  const handleUnstake = async (tokenId) => {
    if (!provider || !account) return;

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tx = await contract.unstake(tokenId, { gasLimit: 300000 });
      await tx.wait();
      if (onUnstakeSuccess) onUnstakeSuccess();
      fetchNFTs();
    } catch (error) {
      console.error("Unstaking failed:", error);
    }
  };

  useEffect(() => {
    fetchNFTs();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const stakeFilter = contract.filters.Staked(account);
    const unstakeFilter = contract.filters.Unstaked(account);

    contract.on(stakeFilter, fetchNFTs);
    contract.on(unstakeFilter, fetchNFTs);

    return () => {
      contract.off(stakeFilter, fetchNFTs);
      contract.off(unstakeFilter, fetchNFTs);
    };
  }, [provider, account, activeTab]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return [
      days > 0 ? `${days}d` : null,
      hours > 0 ? `${hours}h` : null,
      mins > 0 ? `${mins}m` : null,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div
      className={`rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg p-6`}
    >
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "staked"
              ? darkMode
                ? "text-veldora-gold border-b-2 border-veldora-gold"
                : "text-veldora-darkgold border-b-2 border-veldora-darkgold"
              : darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("staked")}
        >
          Staked NFTs
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "unstaked"
              ? darkMode
                ? "text-veldora-gold border-b-2 border-veldora-gold"
                : "text-veldora-darkgold border-b-2 border-veldora-darkgold"
              : darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("unstaked")}
        >
          Unstaked NFTs
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-8">
          <ShieldCheckIcon
            className={`w-12 h-12 mx-auto ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {activeTab === "staked"
              ? "No NFTs currently staked"
              : "No unstaked NFTs in your wallet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {nfts.map((nft) => {
              const style = rarityStyles[nft.rarity];
              const duration = formatDuration(timeStaked[nft.id] || 0);

              return (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${style.bg} ${style.border} rounded-lg overflow-hidden border-2`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`${style.text} font-bold`}>
                          NFT #{nft.id}
                        </h3>
                        <span
                          className={`text-xs ${
                            darkMode ? "bg-gray-600/50" : "bg-white/70"
                          } px-2 py-1 rounded-full`}
                        >
                          {nft.rarity}
                        </span>
                      </div>
                      <span className="text-2xl">{style.icon}</span>
                    </div>

                    {activeTab === "staked" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center">
                          <ClockIcon
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-sm ml-2 ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Staked: {duration}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <SparklesIcon
                            className={`w-4 h-4 ${
                              darkMode
                                ? "text-veldora-gold"
                                : "text-veldora-darkgold"
                            }`}
                          />
                          <span
                            className={`text-sm ml-2 ${
                              darkMode
                                ? "text-veldora-gold"
                                : "text-veldora-darkgold"
                            }`}
                          >
                            Earning{" "}
                            {
                              [10, 20, 50, 100][
                                ["Common", "Rare", "Epic", "Legendary"].indexOf(
                                  nft.rarity
                                )
                              ]
                            }{" "}
                            pts/day
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        activeTab === "staked"
                          ? handleUnstake(nft.id)
                          : handleStake(nft.id)
                      }
                      className={`mt-4 w-full py-2 rounded-lg font-medium ${
                        activeTab === "staked"
                          ? darkMode
                            ? "bg-red-900/30 text-red-400 hover:bg-red-800/50"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                          : darkMode
                          ? "bg-green-900/30 text-green-400 hover:bg-green-800/50"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {activeTab === "staked" ? "Unstake" : "Stake"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
