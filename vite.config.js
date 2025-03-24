import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "/@": "./src",
    },
  },

  define: {
    "process.env.CONTRACT_ADDRESS": process.env.CONTRACT_ADDRESS,
  },
});
