import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import basicSSl from "@vitejs/plugin-basic-ssl";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  root: "./", // Sources files (typically where index.html is)
  publicDir: "./public/", // Path from "root" to public assets (files that are served as they are)
  server: {
    open: true,
    host: true, // Open to local network and display URL
  },
  build: {
    outDir: "./dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },

  plugins: [
    react(),
    basicSSl(),
    tailwindcss(),
    {
      name: "watch-and-reload",
      configureServer(server) {
        server.watcher.add("./public/");

        server.watcher.on("all", (event, file) => {
          if (!file.includes("/public/")) return;

          if (event === "add" || event === "unlink") server.restart();
          else server.ws.send({ type: "full-reload" });
        });
      },
    },
  ],
});
