// TanStack Start's plugin list overflows TypeScript's PluginOption check, so this file is left out of tsconfig.
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port,
    strictPort: Boolean(process.env.PORT),
    allowedHosts: ['desk-garage-web.localhost'],
  },
  plugins: [
    ...tanstackStart({
      router: {
        quoteStyle: 'single',
        semicolons: true,
        generatedRouteTree: 'route-tree.gen.ts',
      },
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
