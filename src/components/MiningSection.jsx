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
    "event NFTMinted(address indexed owner, uint256 indexed tokenId, uint256 rarity)",
  ];

  const mineNFT = async () => {
    if (!provider || !account) {
      setMintResult("Please connect your wallet");
      return;
    }

    setIsMining(true);
    setMintResult(null);
    setShowConfetti(false);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Set a conservative gas limit to prevent estimation issues
      const tx = await contract.mintNFT({ gasLimit: 300000 });
      setMintResult("Transaction sent. Waiting for confirmation...");

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction reverted");
      }

      const event = receipt.events?.find((e) => e.event === "NFTMinted");
      if (event) {
        const rarityTypes = ["Common", "Rare", "Epic", "Legendary"];
        const rarity = rarityTypes[event.args.rarity];
        const tokenId = event.args.tokenId.toString();

        setMintResult(`Success! You minted a ${rarity} NFT (ID: ${tokenId})`);
        setShowConfetti(true);

        // Visual celebration
        createFloatingCelebration(event.args.rarity);

        // Call success handler if provided
        if (onMintSuccess) {
          onMintSuccess({
            tokenId,
            rarity,
            transactionHash: receipt.transactionHash,
          });
        }

        // Auto-hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        setMintResult("Minting succeeded but no event was emitted");
      }
    } catch (error) {
      console.error("Mining error:", error);
      handleMintError(error);
    } finally {
      setIsMining(false);
    }
  };

  const handleMintError = (error) => {
    let errorMessage = "Minting failed. Please try again.";

    if (error.code === 4001) {
      errorMessage = "Transaction was rejected by your wallet";
    } else if (error.message.includes("reverted")) {
      errorMessage = "Transaction was rejected by the contract";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage = "Insufficient ETH for gas fees";
    }

    setMintResult(errorMessage);
  };

  const createFloatingCelebration = (rarity) => {
    const button = document.getElementById("mine-button");
    if (!button) return;

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

    // Create 20-30 floating particles
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("div");
      particle.className = `fixed text-4xl z-50 ${colors[rarity]} pointer-events-none`;
      particle.textContent = emojis[rarity];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      document.body.appendChild(particle);

      // Animation properties
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      const duration = 1000 + Math.random() * 1000;
      const size = 0.5 + Math.random() * 0.5;

      particle.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 1,
            top: `${centerY}px`,
            left: `${centerX}px`,
          },
          {
            transform: `translate(-50%, -50%) scale(${size})`,
            opacity: 0,
            top: `${centerY - Math.sin(angle) * distance}px`,
            left: `${centerX + Math.cos(angle) * distance}px`,
          },
        ],
        {
          duration,
          easing: "cubic-bezier(0.1, 0.8, 0 0.2, 1)",
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
                      : mintResult.includes("sent")
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
