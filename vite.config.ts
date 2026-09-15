// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: process.env.NODE_ENV === "production" ? "/" : "/p4p-app-v2/",
  },
  base: process.env.NODE_ENV === "production" ? "/" : "/p4p-app-v2/",
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    server: { entry: "server" },
    prerender: {
      enabled: false,  // ⭐ Disabled — SSR handles everything on Vercel
    },
  },
});