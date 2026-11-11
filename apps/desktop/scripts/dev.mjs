import { spawn } from 'node:child_process';

import { createServer } from 'vite-plus';

import electron from 'electron';

if (!process.env.PORTLESS_URL || !process.env.PORT) {
  throw new Error('Start the desktop app with pnpm dev from the workspace root (Portless is required).');
}

const server = await createServer();
await server.listen();
const electronEnvironment = { ...process.env };
delete electronEnvironment.ELECTRON_RUN_AS_NODE;
const child = spawn(electron, ['.'], { stdio: 'inherit', env: electronEnvironment });

child.on('exit', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
