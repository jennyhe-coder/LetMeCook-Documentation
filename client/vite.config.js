import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['letmecook.ca', 'www.letmecook.ca'],
    proxy: {
      "/api/letmecook.ca": {
        target: "http://localhost:8080/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/letmecook\.ca/, "/api"),
      },
    },
  },
});
