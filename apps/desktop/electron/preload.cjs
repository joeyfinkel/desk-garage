const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('deskGarage', {
  command: (command) => ipcRenderer.invoke('workspace:command', command),
  importDropped: (containerId, files) =>
    ipcRenderer.invoke('workspace:command', {
      type: 'importFiles',
      containerId,
      paths: files.map((file) => webUtils.getPathForFile(file)),
    }),
  dragFile: (id) => ipcRenderer.send('workspace:drag', id),
  onChanged: (listener) => {
    const handler = () => listener();
    ipcRenderer.on('workspace:changed', handler);

    return () => ipcRenderer.removeListener('workspace:changed', handler);
  },
});
