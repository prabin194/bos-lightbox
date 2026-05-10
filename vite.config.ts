import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "document-preview",
    },
    rollupOptions: {
      external: [/^lit/],
    },
    minify: true,
    sourcemap: true,
  },
});
