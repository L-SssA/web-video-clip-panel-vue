import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
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
  build: {
    lib: {
      entry: "src/index.ts",
      name: "components",
      fileName: (format) => `index.${format}.js`,
      cssFileName: "style",
    },
    rolldownOptions: {
      external: ["vue", "@web-vcp/core"],
      output: {
        globals: {
          vue: "Vue",
          "@web-vcp/core": "@web-vcp/core",
        },
      },
      // 忽略无效的 PURE 注释警告
      onwarn(warning, defaultHandler) {
        if (warning.code === "INVALID_ANNOTATION") return;
        defaultHandler(warning);
      },
    },
  },
});
