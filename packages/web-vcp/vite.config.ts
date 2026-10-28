import { fileURLToPath, URL } from "node:url";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      dts({
        tsconfigPath: "./tsconfig.app.json",
        bundleTypes: mode === "production",
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
        name: "web-vcp",
        fileName: (format) => `index.${format}.js`,
        cssFileName: "style",
      },
      rolldownOptions: {
        external: ["@web-vcp/core", "@web-vcp/video-clip-canvas", "@web-vcp/video-clip-panel"],
        output: {
          globals: {
            "@web-vcp/core": "@web-vcp/core",
            "@web-vcp//video-clip-canvas": "@web-vcp//video-clip-canvas",
            "@web-vcp/video-clip-panel": "@web-vcp/video-clip-panel",
          },
        },
      },
    },
  };
});
