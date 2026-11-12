import { app, nativeImage } from 'electron';
import { fileURLToPath } from 'node:url';

const iconPath = fileURLToPath(new URL('../electron/dock-icon.png', import.meta.url));

export function applyDockIcon() {
  if (process.platform !== 'darwin') {
    return;
  }

  const image = nativeImage.createFromPath(iconPath);

  if (!image.isEmpty()) {
    app.dock?.setIcon(image);
  }
}
