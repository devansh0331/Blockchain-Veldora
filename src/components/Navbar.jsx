import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MenuIcon, XIcon, MoonIcon, SunIcon, WalletIcon } from "./Icons";
import { ethers } from "ethers";

export default function Navbar({ account, setAccount, setProvider }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        console.log(provider);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Mint", path: "/mint" },
    { name: "Stake", path: "/stake" },
    { name: "Shop", path: "/shop" },
    { name: "Dashboard", path: "/dashboard" },
    // { name: "Inventory", path: "/inventory" },
  ];

  return (
    <>
      {/* Enhanced Navbar with gradient background */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          darkMode
            ? scrolled
              ? "bg-veldora-darkpurple from-gray-900/90 to-veldora-darkpurple/90 backdrop-blur-md"
              : "bg-veldora-darkpurple from-gray-900 to-veldora-darkpurple"
            : scrolled
            ? "bg-gray-300/90"
            : "bg-gray-300/90"
        } border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-2xl font-bold ${
                  darkMode ? "text-veldora-gold" : "text-veldora-darkpurple"
                }`}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-veldora-gold to-veldora-darkgold">
                  Veldora
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-1 py-2 text-md font-semibold transition-colors relative ${
                        isActive
                          ? darkMode
                            ? "text-veldora-gold"
                            : "text-veldora-darkpurple"
                          : darkMode
                          ? "text-gray-300 hover:text-veldora-gold"
                          : "text-gray-700 hover:text-veldora-darkpurple"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="navUnderline"
                            className={`absolute bottom-0 left-0 w-full h-0.5 ${
                              darkMode
                                ? "bg-veldora-gold"
                                : "bg-veldora-darkpurple"
                            }`}
                            transition={{ type: "spring", bounce: 0.25 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "text-veldora-gold hover:bg-gray-800"
                    : "text-veldora-darkpurple hover:bg-gray-200"
                }`}
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              {/* Wallet Connection Button */}
              {account ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
                    darkMode
                      ? "bg-gray-800 text-veldora-gold border border-veldora-gold/30"
                      : "bg-veldora-darkpurple/10 text-veldora-darkpurple"
                  }`}
                >
                  <WalletIcon className="w-4 h-4 mr-2" />
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </motion.div>
              ) : (
                <motion.button
                  onClick={connectWallet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                    darkMode
                      ? "bg-veldora-gold text-gray-900 hover:bg-veldora-darkgold"
                      : "bg-veldora-darkpurple text-white hover:bg-veldora-darkpurple/90"
                  }`}
                >
                  <WalletIcon className="w-4 h-4 mr-2" />
                  Connect Wallet
                </motion.button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-4">
              <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "text-veldora-gold hover:bg-gray-800"
                    : "text-veldora-darkpurple hover:bg-gray-200"
                }`}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-md ${
                  darkMode
                    ? "text-gray-300 hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden overflow-hidden ${
                darkMode
                  ? "bg-gradient-to-b from-gray-900 to-veldora-darkpurple"
                  : "bg-white"
              }`}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? darkMode
                            ? "bg-gray-800 text-veldora-gold"
                            : "bg-gray-200 text-veldora-darkpurple"
                          : darkMode
                          ? "text-gray-300 hover:bg-gray-800 hover:text-veldora-gold"
                          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                <div className="px-3 py-3">
                  {account ? (
                    <div
                      className={`flex items-center text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <WalletIcon className="w-4 h-4 mr-2" />
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </div>
                  ) : (
                    <motion.button
                      onClick={connectWallet}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium ${
                        darkMode
                          ? "bg-veldora-gold text-gray-900 hover:bg-veldora-darkgold"
                          : "bg-veldora-darkpurple text-white hover:bg-veldora-darkpurple/90"
                      }`}
                    >
                      <WalletIcon className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
}
