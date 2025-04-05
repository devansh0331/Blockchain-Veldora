import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import {
  CubeIcon,
  GiftIcon,
  LightningBoltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "./Icons";

export default function About() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: <CubeIcon className="w-8 h-8" />,
      title: "NFT Collection",
      description:
        "Unique digital assets with varying rarities that users can collect, trade, and stake.",
      tab: "nfts",
      content: (
        <div className="space-y-6">
          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p>
              Veldora NFTs are unique digital collectibles with four rarity
              levels. Each NFT is randomly assigned a rarity when minted, with
              Legendary being the rarest and most valuable.
            </p>
            <p>
              NFT ownership is recorded on the Ethereum blockchain, giving you
              true digital ownership of your assets. You can view your
              collection in your wallet or on popular NFT marketplaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <CubeIcon className="w-5 h-5 mr-2" /> Minting NFTs
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Each mint costs gas fees + small platform fee</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Rarity is randomly assigned at mint time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Higher rarity NFTs have better staking rewards</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <GiftIcon className="w-5 h-5 mr-2" /> Rarity Upgrades
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use Rarity Catalyst items to upgrade your NFTs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Each upgrade increases rarity by one level</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Legendary NFTs cannot be upgraded further</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <LockClosedIcon className="w-8 h-8" />,
      title: "Staking System",
      description:
        "Earn points by staking your NFTs, with higher rewards for rarer items.",
      tab: "staking",
      content: (
        <div className="space-y-6">
          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p>
              Stake your Veldora NFTs to earn points that can be used in the
              item shop. The longer you stake and the rarer your NFT, the more
              points you'll accumulate.
            </p>
            <p>
              Points are calculated based on the time staked and the NFT's
              rarity. You can unstake at any time to claim your accumulated
              points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <LockClosedIcon className="w-5 h-5 mr-2" /> Staking Mechanics
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Stake any NFT from your collection</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Rewards accumulate every second</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Unstake anytime to claim rewards</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <LightningBoltIcon className="w-5 h-5 mr-2" /> Reward
                Calculation
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Common: 10 points/hour</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Rare: 20 points/hour</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Epic: 50 points/hour</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Legendary: 100 points/hour</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <ShoppingCartIcon className="w-8 h-8" />,
      title: "Item Shop",
      description:
        "Purchase special items using earned points to boost your NFT experience.",
      tab: "shop",
      content: (
        <div className="space-y-6">
          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p>
              Spend your hard-earned staking points on powerful items in the
              Veldora shop. Each item provides unique benefits that can enhance
              your NFT experience.
            </p>
            <p>
              Items range from temporary boosts to permanent upgrades. Choose
              wisely based on your strategy and goals.
            </p>
          </div>

          <div className="mt-8">
            <h3
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Available Items
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 1,
                  name: "Power Booster",
                  cost: "1000 pts",
                  effect: "+20% staking rewards for 24h",
                  icon: <LightningBoltIcon className="w-6 h-6" />,
                },
                {
                  id: 2,
                  name: "Rarity Catalyst",
                  cost: "2500 pts",
                  effect: "Upgrade your NFT's rarity level",
                  icon: <GiftIcon className="w-6 h-6" />,
                },
                {
                  id: 3,
                  name: "Mining Accelerator",
                  cost: "500 pts",
                  effect: "Instantly gain +10% of your current points",
                  icon: <ArrowPathIcon className="w-6 h-6" />,
                },
                {
                  id: 4,
                  name: "Lucky Charm",
                  cost: "800 pts",
                  effect: "30% chance to mint a free NFT when used",
                  icon: <SparklesIcon className="w-6 h-6" />,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`p-2 rounded-full mr-4 ${
                        darkMode ? "bg-gray-600" : "bg-gray-100"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p
                        className={`text-sm mb-2 ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {item.effect}
                      </p>
                      <div
                        className={`text-sm font-medium ${
                          darkMode
                            ? "text-veldora-gold"
                            : "text-veldora-darkpurple"
                        }`}
                      >
                        Cost: {item.cost}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <LightningBoltIcon className="w-8 h-8" />,
      title: "Boost Mechanics",
      description:
        "Temporary boosts that enhance your staking rewards or provide special abilities.",
      tab: "boosts",
      content: (
        <div className="space-y-6">
          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p>
              Boosts provide temporary enhancements to your Veldora experience.
              Activate them strategically to maximize your rewards and progress.
            </p>
            <p>
              Some boosts come from shop items, while others may be awarded
              through special events or achievements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <ShieldCheckIcon className="w-5 h-5 mr-2" /> Active Boosts
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Only one boost can be active at a time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Boosts don't stack with each other</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Timer continues counting when offline</span>
                </li>
              </ul>
            </div>

            <div
              className={`p-6 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <ClockIcon className="w-5 h-5 mr-2" /> Boost Duration
              </h3>
              <ul
                className={`space-y-2 ${
                  darkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Power Booster: 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Event boosts vary by promotion</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check your active boost timer</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const rarityLevels = [
    {
      name: "Common",
      chance: "60%",
      color: "text-gray-400",
      reward: "10 pts/hour",
    },
    {
      name: "Rare",
      chance: "25%",
      color: "text-blue-400",
      reward: "20 pts/hour",
    },
    {
      name: "Epic",
      chance: "10%",
      color: "text-purple-500",
      reward: "50 pts/hour",
    },
    {
      name: "Legendary",
      chance: "5%",
      color: "text-yellow-400",
      reward: "100 pts/hour",
    },
  ];

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome to Veldora
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-xl max-w-3xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-800"
            }`}
          >
            A revolutionary NFT platform combining collectible digital assets
            with DeFi staking mechanics and an in-game economy.
          </motion.p>
        </div>

        {/* Overview Section */}
        <div
          className={`rounded-xl p-6 mb-8 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Platform Overview
          </h2>
          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p className={darkMode ? "text-gray-300" : "text-gray-800"}>
              Veldora is an innovative Web3 platform that merges NFT collecting
              with DeFi staking rewards. Our ecosystem is built on Ethereum and
              offers:
            </p>
            <ul className={darkMode ? "text-gray-300" : "text-gray-800"}>
              <li>
                <span className="mr-2">•</span>
                <span>A collection of unique, rarity-based NFTs</span>
              </li>
              <li>
                <span className="mr-2">•</span>
                <span>
                  A staking system that rewards users with utility points
                </span>
              </li>
              <li>
                <span className="mr-2">•</span>
                <span>An in-game shop with power-ups and boosters</span>{" "}
              </li>
              <li>
                <span className="mr-2">•</span>
                <span>Rarity upgrades and special abilities</span>
              </li>
            </ul>
            <br />
            <p className={darkMode ? "text-gray-300" : "text-gray-800"}>
              The platform is governed by a transparent smart contract that
              ensures fair distribution of rewards and secure transactions.
            </p>
          </div>

          <div className="mt-6">
            <h3
              className={`text-lg font-semibold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Key Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-1 ${
                    darkMode ? "text-veldora-gold" : "text-veldora-darkpurple"
                  }`}
                >
                  4
                </div>
                <div className={darkMode ? "text-gray-300" : "text-gray-800"}>
                  NFT Rarity Tiers
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-1 ${
                    darkMode ? "text-veldora-gold" : "text-veldora-darkpurple"
                  }`}
                >
                  4
                </div>
                <div className={darkMode ? "text-gray-300" : "text-gray-800"}>
                  Shop Items
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-1 ${
                    darkMode ? "text-veldora-gold" : "text-veldora-darkpurple"
                  }`}
                >
                  100x
                </div>
                <div className={darkMode ? "text-gray-300" : "text-gray-800"}>
                  Max Reward Multiplier
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3
              className={`text-lg font-semibold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              NFT Rarity System
            </h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table
                className={`min-w-full divide-y ${
                  darkMode ? "divide-gray-700" : "divide-gray-300"
                }`}
              >
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } sm:pl-6`}
                    >
                      Rarity
                    </th>
                    <th
                      scope="col"
                      className={`px-3 py-3.5 text-left text-sm font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mint Chance
                    </th>
                    <th
                      scope="col"
                      className={`px-3 py-3.5 text-left text-sm font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Staking Reward
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode
                      ? "divide-gray-700 bg-gray-800"
                      : "divide-gray-200 bg-white"
                  }`}
                >
                  {rarityLevels.map((rarity, index) => (
                    <tr key={index}>
                      <td
                        className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium ${rarity.color} sm:pl-6`}
                      >
                        {rarity.name}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-4 text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {rarity.chance}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-4 text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {rarity.reward}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl cursor-pointer transition-all ${
                activeTab === feature.tab
                  ? darkMode
                    ? "bg-gray-700"
                    : "bg-gray-100"
                  : darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-50"
              } shadow-md border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
              onClick={() =>
                setActiveTab(
                  activeTab === feature.tab ? "overview" : feature.tab
                )
              }
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    darkMode
                      ? "bg-gray-600 text-veldora-gold"
                      : "bg-gray-100 text-veldora-darkpurple"
                  }`}
                >
                  {feature.icon}
                </div>
                {activeTab === feature.tab ? (
                  <ChevronDownIcon
                    className={`w-5 h-5 mt-1 ${
                      darkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  />
                ) : (
                  <ChevronUpIcon
                    className={`w-5 h-5 mt-1 ${
                      darkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  />
                )}
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {feature.title}
              </h3>
              <p className={darkMode ? "text-gray-300" : "text-gray-800"}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature Content */}
        {activeTab !== "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-xl p-6 mb-8 ${
              darkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"
            } shadow-lg border ${
              darkMode ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {features.find((f) => f.tab === activeTab)?.title}
            </h3>
            {features.find((f) => f.tab === activeTab)?.content}
          </motion.div>
        )}

        {/* Smart Contract Info */}
        <div
          className={`rounded-xl p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Smart Contract Details
          </h2>

          <div className={`prose ${darkMode ? "prose-invert" : ""}`}>
            <p className={darkMode ? "text-gray-300" : "text-gray-800"}>
              The Veldora platform is powered by an Ethereum smart contract that
              handles all core functionality:
            </p>
            <ul className={darkMode ? "text-gray-300" : "text-gray-800"}>
              <li>
                <span className="mr-2">•</span>
                NFT minting and ownership tracking
              </li>
              <li>
                <span className="mr-2">•</span>Rarity assignment and upgrades
              </li>
              <li>
                <span className="mr-2">•</span>Staking mechanics and reward
                calculation
              </li>
              <li>
                <span className="mr-2">•</span>Item shop inventory and purchases
              </li>
              <li>
                <span className="mr-2">•</span>Boost activation and management
              </li>
            </ul>

            <br />
            <p className={darkMode ? "text-gray-300" : "text-gray-800"}>
              NOTE: The contract has been audited for security and optimized for
              gas efficiency. All critical functions are protected by
              appropriate access controls.
            </p>
          </div>

          {/* <div className="mt-6">
            <h3
              className={`text-lg font-semibold mb-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Contract Address
            </h3>
            <div
              className={`p-3 rounded-md font-mono text-sm ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {import.meta.env.VITE_CONTRACT_ADDRESS}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
