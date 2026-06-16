import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // Allow access through ngrok tunnels (leading dot matches any subdomain,
    // so it works with the random URL ngrok assigns each session).
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app", ".ngrok.io"],
    // Proxy API calls to the local backend so they share the frontend's origin.
    // This makes mobile/ngrok work (no localhost-on-phone problem) and avoids
    // CORS / cross-site cookie issues. Requires the dev API base URL to be
    // relative — see frontend/.env.development (VITE_API_URL empty).
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
