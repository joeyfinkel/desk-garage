import { app, Menu, nativeImage, protocol, Tray } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkspaceStore } from './workspace/store';
import { registerWorkspaceIpc } from './workspace/ipc';
import { registerFilePreviews } from './workspace/previews';
import { setApplicationMenu } from './application-menu';
import { shouldOpenAtLogin } from './menu-bar-app';
import { createWorkspaceWindows } from './windows';

let tray: Tray;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'desk-file',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, bypassCSP: true },
  },
]);

app.setName('DeskGarage');
app.on('window-all-closed', () => {});

if (process.platform === 'darwin') {
  app.setActivationPolicy('accessory');
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  void app.whenReady().then(() => {
    const iconPath = fileURLToPath(new URL('../electron/tray.png', import.meta.url));
    const store = createWorkspaceStore(join(app.getPath('userData'), 'workspace'));
    const { hasDialog } = registerWorkspaceIpc(store);
    registerFilePreviews(store);

    if (shouldOpenAtLogin({ packaged: app.isPackaged, platform: process.platform })) {
      app.setLoginItemSettings({ openAtLogin: true });
    }

    const windows = createWorkspaceWindows(hasDialog);
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    const menu = Menu.buildFromTemplate([
      { label: 'Quick access', click: () => windows.showQuick(tray) },
      { label: 'Open DeskGarage', click: () => windows.showMain() },
      { type: 'separator' },
      { label: 'Quit DeskGarage', click: () => app.quit() },
    ]);
    setApplicationMenu(
      () => windows.showQuick(tray),
      () => windows.showMain(),
    );
    tray.setToolTip('DeskGarage');
    tray.on('click', () => windows.showQuick(tray));
    tray.on('right-click', () => {
      windows.noteStatusItemClick();
      tray.popUpContextMenu(menu);
    });
    app.on('activate', windows.activate);
    app.on('second-instance', () => windows.showMain());
  });
}
