import { app, BrowserWindow, ipcMain, screen } from 'electron';
import type { Tray } from 'electron';
import { fileURLToPath } from 'node:url';
import { getTrustedWindow } from './trusted-window';
import { positionTrayPanel } from './panel-position';

export function createWorkspaceWindows(hasDialog: (window: BrowserWindow) => boolean) {
  let main: BrowserWindow | undefined;
  let quick: BrowserWindow | undefined;
  let isQuitting = false;
  let hiddenAt = 0;

  app.on('before-quit', () => {
    isQuitting = true;
  });

  function load(window: BrowserWindow, route: string) {
    if (process.env.PORTLESS_URL) {
      const url = new URL(process.env.PORTLESS_URL);
      url.hash = route;

      return window.loadURL(url.toString());
    }

    return window.loadFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)), { hash: route });
  }

  function makeWindow(isQuick: boolean) {
    const window = new BrowserWindow({
      width: isQuick ? 420 : 1060,
      height: isQuick ? 580 : 720,
      minWidth: isQuick ? 320 : 740,
      minHeight: isQuick ? 300 : 540,
      title: isQuick ? 'DeskGarage Quick Access' : 'DeskGarage',
      show: false,
      backgroundColor: '#f7f7f4',
      frame: !isQuick,
      resizable: !isQuick,
      maximizable: !isQuick,
      minimizable: !isQuick,
      alwaysOnTop: isQuick,
      skipTaskbar: isQuick,
      titleBarStyle: !isQuick && process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: fileURLToPath(new URL('../electron/preload.cjs', import.meta.url)),
      },
    });
    window.on('page-title-updated', (event) => event.preventDefault());
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event) => event.preventDefault());
    window.on('close', (event) => {
      if (!isQuitting && isQuick) {
        event.preventDefault();
        window.hide();
      }
    });

    return window;
  }

  function showMain(containerId?: string) {
    quick?.hide();
    const route = containerId ? `/containers/${encodeURIComponent(containerId)}` : '/containers';

    if (!main || main.isDestroyed()) {
      main = makeWindow(false);
      main.once('closed', () => {
        main = undefined;
      });
      main.once('ready-to-show', () => {
        main?.show();
        main?.focus();
      });
      void load(main, route);
    } else {
      if (main.isMinimized()) {
        main.restore();
      }

      if (containerId) {
        void load(main, route);
      }

      main.show();
      main.focus();
    }
  }

  function showQuick(tray: Tray) {
    if (quick?.isVisible()) {
      quick.hide();

      return;
    }

    // The tray click itself can blur the panel just before its click event.
    if (Date.now() - hiddenAt < 200) {
      return;
    }

    if (!quick || quick.isDestroyed()) {
      quick = makeWindow(true);
      quick.on('blur', () => {
        if (quick && !hasDialog(quick)) {
          hiddenAt = Date.now();
          quick.hide();
        }
      });
      quick.webContents.on('before-input-event', (_event, input) => {
        if (input.key === 'Escape') {
          quick?.hide();
        }
      });
      quick.once('ready-to-show', () => {
        quick?.show();
        quick?.focus();
      });
      void load(quick, '/quick');
    }

    const anchor = tray.getBounds();
    quick.setBounds(positionTrayPanel(anchor, screen.getDisplayMatching(anchor).workArea));

    if (!quick.webContents.isLoading()) {
      quick.show();
      quick.focus();
    }
  }

  ipcMain.handle('window:open-main', (event, containerId: unknown) => {
    getTrustedWindow(event);

    if (containerId !== undefined && (typeof containerId !== 'string' || containerId.length > 200)) {
      throw new Error('Invalid container selection.');
    }

    showMain(containerId);
  });
  ipcMain.on('window:hide-quick', (event) => {
    const window = getTrustedWindow(event);

    if (window === quick) {
      window.hide();
    }
  });

  function activate() {
    if (!quick?.isVisible()) {
      showMain();
    }
  }

  return { showMain, showQuick, activate };
}
