import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { ethers } from "ethers";
import {
  ShoppingCartIcon,
  LightningBoltIcon,
  GiftIcon,
  CubeIcon,
  SparklesIcon,
} from "./Icons";

export default function ShopSection({
  provider,
  account,
  pointsBalance,
  onPurchaseSuccess,
}) {
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState({});
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState("shop");
  const [statusMessage, setStatusMessage] = useState(null);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function shopItems(uint256) view returns (uint256 id, string name, uint256 cost, bool available)",
    "function purchaseItem(uint256 itemId, uint256 quantity) external",
    "function useItem(uint256 itemId) external",
    "function ownedItems(address, uint256) view returns (uint256)",
    "function stakingPoints(address) view returns (uint256)",
    "event ItemPurchased(address indexed buyer, uint256 itemId, uint256 quantity)",
    "event ItemUsed(address indexed user, uint256 itemId)",
  ];

  const shopItems = [
    {
      id: 1,
      name: "Power Booster",
      cost: 1000,
      effect: "+20% staking rewards for 24h",
    },
    {
      id: 2,
      name: "Rarity Catalyst",
      cost: 2500,
      effect: "Upgrade NFT rarity",
    },
    {
      id: 3,
      name: "Mining Accelerator",
      cost: 500,
      effect: "+10% instant points",
    },
    {
      id: 4,
      name: "Lucky Charm",
      cost: 800,
      effect: "30% chance for free mint",
    },
  ];

  const showStatusMessage = (message, status = "processing") => {
    setStatusMessage({ text: message, status });
    // Only auto-dismiss if it's success or error
    if (status !== "processing") {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  const fetchShopData = async () => {
    if (!provider || !account) return;

    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider
      );

      const ownership = await Promise.all(
        [1, 2, 3, 4].map(async (itemId) => {
          return {
            id: itemId,
            quantity: (await contract.ownedItems(account, itemId)).toNumber(),
          };
        })
      );

      const ownedMap = ownership.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});

      setOwnedItems(ownedMap);
    } catch (error) {
      console.error("Shop data fetch error:", error);
      showStatusMessage("Failed to load shop data", "error");
    }
  };

  const purchaseItem = async (itemId, cost) => {
    if (!account) {
      showStatusMessage(
        "Please connect your wallet to make purchases",
        "error"
      );
      return;
    }

    if (pointsBalance < cost) {
      showStatusMessage("Not enough points for this purchase", "error");
      return;
    }
    if (!provider) return;

    clearStatusMessage();
    setIsPurchasing(true);
    showStatusMessage("Processing your purchase...", "processing");

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.purchaseItem(itemId, 1, { gasLimit: 300000 });
      showStatusMessage(
        "Transaction submitted. Waiting for confirmation...",
        "processing"
      );

      await tx.wait();
      showStatusMessage("Purchase successful!", "success");

      // This will trigger the points balance refresh
      if (onPurchaseSuccess) onPurchaseSuccess();
      fetchShopData();
    } catch (error) {
      console.error("Purchase failed:", error);
      let errorMessage = "Purchase failed";

      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fee";
      } else if (error.message.includes("execution reverted")) {
        errorMessage = "Transaction reverted by contract";
      }

      showStatusMessage(errorMessage, "error");
    } finally {
      setIsPurchasing(false);
    }
  };

  const useItem = async (itemId) => {
    if (!account) {
      showStatusMessage("Please connect your wallet to use items", "error");
      return;
    }

    if (!provider || isPurchasing) return;

    clearStatusMessage();
    setIsPurchasing(true);
    showStatusMessage("Using item...", "processing");

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.useItem(itemId, { gasLimit: 300000 });
      showStatusMessage(
        "Transaction submitted. Waiting for confirmation...",
        "processing"
      );

      await tx.wait();
      showStatusMessage("Item used successfully!", "success");

      fetchShopData();
    } catch (error) {
      console.error("Item use failed:", error);
      let errorMessage = "Failed to use item";

      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fee";
      } else if (error.message.includes("execution reverted")) {
        errorMessage =
          error.message.split("reverted:")[1]?.trim() || errorMessage;
      }

      showStatusMessage(errorMessage, "error");
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    if (!provider || !account) return;

    fetchShopData();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const purchaseFilter = contract.filters.ItemPurchased(account);
    const useFilter = contract.filters.ItemUsed(account);

    contract.on(purchaseFilter, fetchShopData);
    contract.on(useFilter, fetchShopData);

    return () => {
      contract.off(purchaseFilter, fetchShopData);
      contract.off(useFilter, fetchShopData);
    };
  }, [provider, account]);

  const getItemIcon = (itemId) => {
    switch (itemId) {
      case 1:
        return <LightningBoltIcon className="w-6 h-6 text-veldora-gold" />;
      case 2:
        return <GiftIcon className="w-6 h-6 text-veldora-gold" />;
      case 3:
        return <CubeIcon className="w-6 h-6 text-veldora-gold" />;
      case 4:
        return <SparklesIcon className="w-6 h-6 text-veldora-gold" />;
      default:
        return <ShoppingCartIcon className="w-6 h-6 text-veldora-gold" />;
    }
  };

  return (
    <div
      className={`rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg p-6`}
    >
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

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "shop"
              ? darkMode
                ? "text-veldora-gold border-b-2 border-veldora-gold"
                : "text-veldora-darkgold border-b-2 border-veldora-darkgold"
              : darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("shop")}
        >
          Item Shop
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "inventory"
              ? darkMode
                ? "text-veldora-gold border-b-2 border-veldora-gold"
                : "text-veldora-darkgold border-b-2 border-veldora-darkgold"
              : darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          My Items ({Object.values(ownedItems).reduce((a, b) => a + b, 0)})
        </button>
      </div>

      {activeTab === "shop" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${
                darkMode
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-full ${
                    darkMode ? "bg-gray-600" : "bg-gray-100"
                  }`}
                >
                  {getItemIcon(item.id)}
                </div>
                <div className="ml-4 flex-1">
                  <h3
                    className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {item.effect}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      darkMode ? "text-veldora-gold" : "text-veldora-darkgold"
                    }`}
                  >
                    {item.cost} PTS
                  </div>
                  <button
                    onClick={() => purchaseItem(item.id, item.cost)}
                    disabled={
                      !account || pointsBalance < item.cost || isPurchasing
                    }
                    className={`mt-2 px-3 py-1 text-sm rounded transition-colors ${
                      !account
                        ? darkMode
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : pointsBalance < item.cost
                        ? darkMode
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : darkMode
                        ? "bg-veldora-darkpurple/40 text-veldora-gold hover:bg-veldora-darkpurple/50"
                        : "bg-veldora-darkpurple/40 text-veldora-darkgold hover:bg-veldora-darkpurple/50"
                    }`}
                  >
                    {!account
                      ? "Connect Wallet"
                      : isPurchasing
                      ? "Processing..."
                      : "Purchase"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {shopItems.filter((item) => ownedItems[item.id] > 0).length > 0 ? (
            shopItems
              .filter((item) => ownedItems[item.id] > 0)
              .map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full ${
                        darkMode ? "bg-gray-600" : "bg-gray-200"
                      }`}
                    >
                      {getItemIcon(item.id)}
                    </div>
                    <div className="ml-3">
                      <h4
                        className={`font-medium ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.effect}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mx-3 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      x{ownedItems[item.id]}
                    </span>
                    <button
                      onClick={() => useItem(item.id)}
                      disabled={!account || isPurchasing}
                      className={`px-3 py-1 text-sm rounded ${
                        !account
                          ? darkMode
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : darkMode
                          ? "bg-veldora-gold/10 text-veldora-gold hover:bg-veldora-gold/20"
                          : "bg-veldora-darkgold/10 text-veldora-darkgold hover:bg-veldora-darkgold/20"
                      }`}
                    >
                      {!account
                        ? "Connect Wallet"
                        : isPurchasing
                        ? "Using..."
                        : "Use"}
                    </button>
                  </div>
                </motion.div>
              ))
          ) : (
            <div className="text-center py-8">
              <ShoppingCartIcon
                className={`w-12 h-12 mx-auto ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <p
                className={`mt-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                You don't own any items yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
