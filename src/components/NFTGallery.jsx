import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext.jsx";
import { ethers } from "ethers";
import { WalletIcon } from "./Icons";

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

export default function NFTGallery({ provider, account }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  const contractABI = [
    "function getOwnedTokens(address owner) view returns (uint256[] memory)",
    "function tokenRarity(uint256 tokenId) view returns (uint256)",
    "event NFTMinted(address indexed owner, uint256 indexed tokenId, uint256 rarity)",
  ];

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

    // Listen for new mint events
    const mintFilter = contract.filters.NFTMinted(account);
    contract.on(mintFilter, fetchNFTs);

    // Initial fetch
    fetchNFTs();

    return () => {
      contract.off(mintFilter, fetchNFTs);
    };
  }, [provider, account]);

  async function fetchNFTs() {
    if (!provider || !account) return;

    setLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      const tokenIds = await contract.getOwnedTokens(account);
      const nftData = await Promise.all(
        tokenIds.map(async (id) => {
          const rarityNum = await contract.tokenRarity(id);
          const rarity = ["Common", "Rare", "Epic", "Legendary"][rarityNum];
          return { id: id.toString(), rarity };
        })
      );

      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 text-center ${
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
          Connect your wallet to view NFTs
        </h3>
        <p
          className={`mt-2 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Your NFT collection will appear here after connecting
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
    <section>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Your NFT Collection
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

      {nfts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 rounded-xl text-center ${
            darkMode ? "bg-gray-800/50" : "bg-white/50"
          } backdrop-blur-sm border ${
            darkMode ? "border-veldora-gold" : "border-gray-200"
          }`}
        >
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            No NFTs found in your wallet
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => {
            const style = rarityStyles[nft.rarity];
            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={`${style.bg} ${style.border} rounded-xl overflow-hidden shadow-lg transition-all duration-300 border-2`}
              >
                <div className="p-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className={`${style.text} font-bold text-lg`}>
                      NFT #{nft.id}
                    </h3>
                    <span className="text-2xl">{style.icon}</span>
                  </div>
                  <div className="mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full ${style.text} ${style.border} border text-sm font-medium`}
                    >
                      {nft.rarity}
                    </span>
                  </div>
                </div>
                <div className={`h-2 ${style.bg} bg-opacity-50`} />
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
