import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      dts({
        processor: "vue",
        tsconfigPath: "./tsconfig.app.json",
        bundleTypes: mode === "production",
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
        name: "video-clip-panel",
        fileName: (format) => `index.${format}.js`,
        cssFileName: "style",
      },
      rolldownOptions: {
        external: ["vue"],
        output: {
          globals: {
            vue: "Vue",
          },
        },
        // 忽略无效的 PURE 注释警告
        onwarn(warning, defaultHandler) {
          if (warning.code === "INVALID_ANNOTATION") return;
          defaultHandler(warning);
        },
      },
    },
  };
});
