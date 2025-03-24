import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ opacity: 0.7 }}
      whileHover={{ opacity: 1, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg ${
        darkMode ? "bg-yellow-100 text-yellow-600" : "bg-gray-800 text-gray-100"
      }`}
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <span className="text-xl">☀️</span>
      ) : (
        <span className="text-xl">🌙</span>
      )}
    </motion.button>
  );
}
