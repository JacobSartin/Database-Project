import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["flight-booking-backend"],
  },
  build: {
    rollupOptions: {
      external: [
        "@node-rs/argon2-wasm32-wasi",
        "pg-hstore",
        "sequelize",
        "@node-rs/argon2",
        "pg",
      ],
    },
  },
});
