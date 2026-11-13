// TanStack Start's plugin list overflows TypeScript's PluginOption check, so this file is left out of tsconfig.
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const testing = mode === 'test' || process.env.VITEST === 'true';

  return {
    server: {
      host: '127.0.0.1',
      port,
      strictPort: Boolean(process.env.PORT),
      allowedHosts: ['desk-garage-web.localhost'],
    },
    plugins: [
      tailwindcss(),
      // The Cloudflare plugin resolves Node builtins through Vite's dev optimizer, which the test runner does not provide.
      ...(testing ? [] : [cloudflare({ viteEnvironment: { name: 'ssr' } })]),
      ...tanstackStart({
        router: {
          quoteStyle: 'single',
          semicolons: true,
          generatedRouteTree: 'route-tree.gen.ts',
        },
      }),
      viteReact(),
    ],
  };
});
