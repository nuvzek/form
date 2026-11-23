import { resolve } from "path";
import { defineConfig } from "vite";
import vueJSX from "@vitejs/plugin-vue-jsx";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "./src/index.ts"),
      name: "NuvzekDevTools",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: { vue: "Vue" },
      },
    },
  },
  plugins: [
    vueJSX(),
    dts({
      cleanVueFileName: true,
      outDir: "dist/types",
      include: ["src/**/*"],
      exclude: ["**/*.spec.ts", "**/*.spec.tsx"],
    }),
  ],
});
