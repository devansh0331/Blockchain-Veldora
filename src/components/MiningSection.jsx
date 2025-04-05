import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext.jsx";
import { ethers } from "ethers";
import Confetti from "react-confetti";

export default function MiningSection({ provider, account, onMintSuccess }) {
  const [isMining, setIsMining] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const { darkMode } = useTheme();

  // Track window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = [
    "function mintNFT() external returns (uint256)",
    "event NFTMinted(address indexed owner, uint256 indexed tokenId, uint8 rarity)",
  ];

  const mineNFT = async () => {
    if (!provider || !account) {
      setMintResult("Please connect your wallet");
      return;
    }

    setIsMining(true);
    setMintResult("Minting in progress...");
    setShowConfetti(false);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.mintNFT({ gasLimit: 300000 });
      setMintResult("Transaction sent. Waiting for confirmation...");

      const receipt = await tx.wait(1);

      // Simple event extraction - works with most providers
      const event =
        receipt.events?.find((e) => e.event === "NFTMinted") ||
        (
          await contract.queryFilter(
            contract.filters.NFTMinted(),
            receipt.blockHash
          )
        )[0];

      if (event) {
        const rarity = ["Common", "Rare", "Epic", "Legendary"][
          event.args.rarity
        ];
        const tokenId = event.args.tokenId.toString();
        setMintResult(`Success! Minted ${rarity} NFT #${tokenId}`);
        setShowConfetti(true);
        // Safe celebration with numeric rarity value
        createFloatingCelebration(rarity);

        if (onMintSuccess) {
          onMintSuccess({
            tokenId,
            rarity,
            transactionHash: receipt.transactionHash,
          });
        }

        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setMintResult("Mint succeeded but couldn't read details");
      }
    } catch (error) {
      setMintResult(
        error.code === "ACTION_REJECTED"
          ? "Transaction rejected"
          : "Minting failed (see console)"
      );
      console.error("Mining error:", error);
    } finally {
      setIsMining(false);
    }
  };

  // Fixed celebration function
  const createFloatingCelebration = (rarity) => {
    const button = document.getElementById("mine-button");
    if (!button || rarity === undefined) return;

    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    const emojis = ["⭐", "✨", "💎", "🔥"];
    const colors = [
      "text-gray-400",
      "text-blue-400",
      "text-purple-400",
      "text-yellow-400",
    ];

    let safeRarity = 0;

    // Validate rarity index
    if (rarity.toString() == "Common") {
      safeRarity = 0;
    }
    if (rarity.toString() == "Rare") {
      safeRarity = 1;
    }
    if (rarity.toString() == "Epic") {
      safeRarity = 2;
    }
    if (rarity.toString() == "Legendary") {
      safeRarity = 3;
    }

    console.log(rarity.toString(), " ", safeRarity, " ", emojis[safeRarity]);

    // Create particles
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("div");
      particle.className = `fixed text-4xl z-50 ${colors[safeRarity]} pointer-events-none`;
      particle.textContent = emojis[safeRarity];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      document.body.appendChild(particle);

      // Safer animation with valid easing
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const duration = 1000 + Math.random() * 1000;

      particle.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 1,
          },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${
              -Math.sin(angle) * distance
            }px) scale(0.5)`,
            opacity: 0,
          },
        ],
        {
          duration,
          easing: "cubic-bezier(0.1, 0.8, 0.2, 1)", // Fixed syntax
        }
      ).onfinish = () => particle.remove();
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
          initialVelocityY={10}
          style={{ position: "fixed" }}
        />
      )}

      <section className="mb-16 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg relative`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Mint Your NFT
          </h2>

          <div className="flex flex-col items-center">
            <motion.button
              id="mine-button"
              disabled={isMining}
              onClick={mineNFT}
              whileHover={!isMining ? { scale: 1.03 } : {}}
              whileTap={!isMining ? { scale: 0.97 } : {}}
              className={`px-8 py-4 text-lg font-semibold rounded-full shadow-lg mb-6 ${
                isMining
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              } text-white relative overflow-hidden min-w-[150px]`}
            >
              {isMining ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Minting...
                </div>
              ) : (
                "Mint NFT"
              )}
            </motion.button>

            <AnimatePresence>
              {mintResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg max-w-md text-center ${
                    mintResult.startsWith("Success")
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : mintResult.includes("sent") ||
                        mintResult.includes("Minting in progress...")
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {mintResult}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>
    </>
  );
}
