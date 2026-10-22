import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE_URL || "/",
    plugins: [
      dts({
        processor: "vue",
        tsconfigPath: "./tsconfig.app.json",
        // bundleTypes: true,
      }),
      ElementPlus({}),
      vue(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
