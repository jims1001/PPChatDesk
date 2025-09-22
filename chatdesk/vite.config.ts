import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    devSourcemap: true, // 开发态生成 CSS/SCSS 源映射
    preprocessorOptions: {
      scss: {
        // 你之前的 dart-sass 现代 API 选项也放这
        api: "modern-compiler",
        sourceMap: true, // 部分预处理器需要显式打开
      },
    },
  },
  build: {
    cssCodeSplit: true, // 按需拆分多个 CSS 产物
    sourcemap: true, // 产出 .css.map，方便定位
  },
});
