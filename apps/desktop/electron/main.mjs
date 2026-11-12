import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import { fileURLToPath } from 'node:url';

let window;
let tray;

function showWindow() {
  window.show();
  window.focus();
}

function createWindow() {
  window = new BrowserWindow({
    width: 1060,
    height: 720,
    minWidth: 740,
    minHeight: 540,
    title: 'DeskGarage',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#f7f7f4',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.on('close', (event) => {
    event.preventDefault();
    window.hide();
  });

  if (process.env.PORTLESS_URL) {
    void window.loadURL(process.env.PORTLESS_URL);
  } else {
    void window.loadFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)));
  }
}

app.setName('DeskGarage');
void app.whenReady().then(() => {
  createWindow();
  const icon = nativeImage.createFromPath(fileURLToPath(new URL('./tray.png', import.meta.url)));
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('DeskGarage');
  tray.on('click', () => {
    if (window.isVisible()) {
      window.hide();
    } else {
      showWindow();
    }
  });
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open DeskGarage', click: showWindow },
      { type: 'separator' },
      { label: 'Quit DeskGarage', click: () => app.exit() },
    ]),
  );
  app.on('activate', showWindow);
});
