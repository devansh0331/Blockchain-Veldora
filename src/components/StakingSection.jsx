import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import { LockClosedIcon, LockOpenIcon, ArrowPathIcon } from "./Icons";

export default function StakingSection({ provider, account, onStakeChange }) {
  const [isStaking, setIsStaking] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [userNFTs, setUserNFTs] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const { darkMode } = useTheme();

  // Contract configuration
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function getOwnedTokens(address) view returns (uint256[])",
    "function tokenRarity(uint256) view returns (uint256)",
    "function stake(uint256) external",
    "function unstake(uint256) external",
    "event Staked(address indexed owner, uint256 indexed tokenId)",
    "event Unstaked(address indexed owner, uint256 indexed tokenId)",
  ];

  // Fetch user's NFTs
  const fetchNFTs = async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );
      const tokenIds = await contract.getOwnedTokens(account);

      const nfts = await Promise.all(
        tokenIds.map(async (id) => {
          const rarity = await contract.tokenRarity(id);
          return {
            id: id.toString(),
            rarity: ["Common", "Rare", "Epic", "Legendary"][rarity],
          };
        })
      );

      setUserNFTs(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  // Handle stake/unstake
  const handleStakeAction = async (isStake) => {
    if (!provider || !selectedTokenId) return;

    setIsStaking(true);
    setStatusMessage(null);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      if (isStake) {
        const tx = await contract.stake(selectedTokenId);
        await tx.wait();
        setStatusMessage({
          text: "NFT staked successfully!",
          isError: false,
        });
      } else {
        const tx = await contract.unstake(selectedTokenId);
        await tx.wait();
        setStatusMessage({
          text: "NFT unstaked successfully!",
          isError: false,
        });
      }

      onStakeChange(); // Trigger parent refresh
      fetchNFTs(); // Refresh NFT list
      setSelectedTokenId(""); // Reset selection
    } catch (error) {
      console.error(isStake ? "Staking failed:" : "Unstaking failed:", error);
      setStatusMessage({
        text: error.message.includes("user rejected")
          ? "Transaction rejected"
          : `${isStake ? "Staking" : "Unstaking"} failed`,
        isError: true,
      });
    } finally {
      setIsStaking(false);
    }
  };

  useEffect(() => {
    if (provider && account) {
      fetchNFTs();

      // Listen for staking events
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
    }
  }, [provider, account]);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div
        className={`p-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          NFT Staking Portal
        </h2>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Selection Panel */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-600"
              }`}
            >
              Your NFTs
            </h3>

            {userNFTs.length === 0 ? (
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                } text-center`}
              >
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  No NFTs found in your wallet
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {userNFTs.map((nft) => (
                  <motion.div
                    key={nft.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedTokenId === nft.id
                        ? darkMode
                          ? "bg-veldora-purple/20 border border-veldora-purple"
                          : "bg-veldora-darkpurple/10 border border-veldora-darkpurple"
                        : darkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTokenId(nft.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        NFT #{nft.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          darkMode
                            ? "bg-gray-600 text-gray-200"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {nft.rarity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Staking Actions
            </h3>

            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              } mb-6`}
            >
              <div className="flex items-center space-x-3 mb-4">
                {selectedTokenId ? (
                  <>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        darkMode ? "bg-green-400" : "bg-green-500"
                      }`}
                    />
                    <span
                      className={darkMode ? "text-gray-200" : "text-gray-700"}
                    >
                      NFT #{selectedTokenId} selected
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        darkMode ? "bg-yellow-400" : "bg-yellow-500"
                      }`}
                    />
                    <span
                      className={darkMode ? "text-gray-200" : "text-gray-700"}
                    >
                      No NFT selected
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  disabled={!selectedTokenId || isStaking}
                  onClick={() => handleStakeAction(true)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium ${
                    !selectedTokenId || isStaking
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-veldora-green hover:bg-veldora-darkgreen"
                  } text-white`}
                >
                  {isStaking ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      <span>Stake NFT</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  disabled={!selectedTokenId || isStaking}
                  onClick={() => handleStakeAction(false)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium ${
                    !selectedTokenId || isStaking
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-veldora-purple hover:bg-veldora-darkpurple"
                  } text-white`}
                >
                  {isStaking ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LockOpenIcon className="w-5 h-5" />
                      <span>Unstake NFT</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg ${
                    statusMessage.isError
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                  }`}
                >
                  {statusMessage.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Help Text */}
        <p
          className={`mt-6 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Stake your NFTs to earn Veldora points. Higher rarity NFTs earn points
          faster.
        </p>
      </div>
    </motion.section>
  );
}
