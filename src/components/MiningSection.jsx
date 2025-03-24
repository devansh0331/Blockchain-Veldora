import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
    if (!provider || !account) return;

    setIsMining(true);
    setMintResult(null);
    setShowConfetti(false);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const tx = await contract.mintNFT();
      const receipt = await tx.wait();

      const event = receipt.events?.find((e) => e.event === "NFTMinted");
      if (event) {
        const rarity = ["Common", "Rare", "Epic", "Legendary"][
          event.args.rarity
        ];
        setMintResult(`You minted a ${rarity} NFT!`);

        // Full-page celebration
        setShowConfetti(true);

        // Create floating NFTs that originate from the button
        const button = document.getElementById("mine-button");
        if (button) {
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
          const emoji = emojis[event.args.rarity];
          const color = colors[event.args.rarity];

          // Create multiple particles
          for (let i = 0; i < 20; i++) {
            const particle = document.createElement("div");
            particle.className = `fixed text-4xl z-50 ${color}`;
            particle.textContent = emoji;
            particle.style.left = `${centerX}px`;
            particle.style.top = `${centerY}px`;
            particle.style.transform = "translate(-50%, -50%)";
            document.body.appendChild(particle);

            // Random angle and distance
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const duration = 1500 + Math.random() * 1000;

            const animation = particle.animate(
              [
                {
                  transform: "translate(-50%, -50%) scale(1)",
                  opacity: 1,
                  top: `${centerY}px`,
                  left: `${centerX}px`,
                },
                {
                  transform: `translate(-50%, -50%) scale(0.5)`,
                  opacity: 0,
                  top: `${centerY - Math.sin(angle) * distance}px`,
                  left: `${centerX + Math.cos(angle) * distance}px`,
                },
              ],
              {
                duration: duration,
                easing: "cubic-bezier(0.1, 0.8, 0.2, 1)",
              }
            );

            animation.onfinish = () => particle.remove();
          }
        }

        // onMintSuccess?.();

        // Auto-hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Mining failed:", error);
      setMintResult("Mining failed. Please try again.");
    } finally {
      setIsMining(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={5}
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-8 py-4 text-lg font-semibold rounded-full shadow-lg mb-6 ${
                isMining
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              } text-white relative overflow-hidden`}
            >
              {isMining ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Minting...
                </motion.span>
              ) : (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Mint NFT
                </motion.span>
              )}

              {isMining && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-20"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                />
              )}
            </motion.button>

            <AnimatePresence>
              {mintResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-lg ${
                    mintResult.includes("failed")
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
