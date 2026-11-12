import { Menu } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';

export function setApplicationMenu(openQuick: () => void, openMain: () => void) {
  const appMenu: MenuItemConstructorOptions[] = process.platform === 'darwin' ? [{ role: 'appMenu' }] : [];
  const menu = Menu.buildFromTemplate([
    ...appMenu,
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      label: 'Window',
      submenu: [
        { label: 'Quick Access', accelerator: 'CommandOrControl+Shift+Space', click: openQuick },
        { label: 'Open DeskGarage', click: openMain },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}
