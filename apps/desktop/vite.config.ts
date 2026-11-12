import { defineConfig } from 'vite-plus';
import { devtools } from '@tanstack/devtools-vite';
import { reactLayoutDevtools } from '@jfdevelops/react-layout-devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  pack: {
    entry: ['electron/main.ts'],
    outDir: 'dist-electron',
    format: 'esm',
    dts: false,
    deps: { neverBundle: ['electron'], alwaysBundle: [/^@desk-garage\//] },
  },
  plugins: [
    devtools(),
    reactLayoutDevtools(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true, generatedRouteTree: './src/route-tree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT),
    strictPort: true,
    allowedHosts: ['desk-garage.localhost'],
  },
});
