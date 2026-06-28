import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    dts({
      processor: "vue",
      tsconfigPath: "./tsconfig.app.json",
      bundleTypes: true,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "components",
      fileName: (format) => `index.${format}.js`,
    },
    rolldownOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
