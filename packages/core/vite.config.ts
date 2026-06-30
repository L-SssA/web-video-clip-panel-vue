import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: "./tsconfig.app.json",
      // bundleTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "core",
      fileName: (format) => `index.${format}.js`,
      cssFileName: "style",
    },
    rolldownOptions: {
      external: ["vue", "pixi.js"],
      output: {
        globals: {
          vue: "Vue",
          "pixi.js": "pixi.js",
        },
      },
    },
  },
});
