import { BrowserWindow } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';

export function getTrustedWindow(event: IpcMainEvent | IpcMainInvokeEvent) {
  const owner = BrowserWindow.fromWebContents(event.sender);

  if (!owner || event.senderFrame !== event.sender.mainFrame) {
    throw new Error('Untrusted desktop request.');
  }

  return owner;
}
