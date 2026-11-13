import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, utimesSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite-plus';
import electron from 'electron';

if (process.platform === 'darwin') {
  const appBundle = join(dirname(electron), '..', '..');
  const installedIcon = join(appBundle, 'Contents', 'Resources', 'electron.icns');
  const appIcon = fileURLToPath(new URL('../electron/icon.icns', import.meta.url));

  if (existsSync(installedIcon) && existsSync(appIcon)) {
    copyFileSync(appIcon, installedIcon);
    const now = new Date();
    utimesSync(appBundle, now, now);
    utimesSync(installedIcon, now, now);
    spawnSync(
      '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister',
      ['-f', appBundle],
      { stdio: 'ignore' },
    );
  }
}

if (!process.env.PORTLESS_URL || !process.env.PORT) {
  throw new Error('Start the desktop app with pnpm dev from the workspace root (Portless is required).');
}

const nativeBuild = spawnSync('pnpm', ['exec', 'vp', 'pack'], { stdio: 'inherit' });

if (nativeBuild.status !== 0) {
  process.exit(nativeBuild.status ?? 1);
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
