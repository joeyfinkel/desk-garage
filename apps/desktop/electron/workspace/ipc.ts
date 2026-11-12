import { BrowserWindow, dialog, ipcMain, nativeImage } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { copyFile } from 'node:fs/promises';
import { Effect, Result, Schema } from 'effect';
import { WorkspaceCommand, WorkspaceError, type WorkspaceResponse } from '@desk-garage/workspace';
import type { createWorkspaceStore } from './store';

export function registerWorkspaceIpc(store: ReturnType<typeof createWorkspaceStore>, dragIconPath: string) {
  function assertSender(event: IpcMainEvent | IpcMainInvokeEvent) {
    const owner = BrowserWindow.fromWebContents(event.sender);

    if (!owner || event.senderFrame !== event.sender.mainFrame) {
      throw new Error('Untrusted workspace request.');
    }

    return owner;
  }

  function notify() {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('workspace:changed');
    }
  }

  ipcMain.handle('workspace:command', async (event, input: unknown): Promise<WorkspaceResponse> => {
    try {
      const window = assertSender(event);
      const command = await Effect.runPromise(Schema.decodeUnknownEffect(WorkspaceCommand)(input));
      let operation;

      if (command.type === 'pickFiles') {
        const result = await dialog.showOpenDialog(window, {
          title: 'Add files to DeskGarage',
          properties: ['openFile', 'multiSelections'],
        });
        operation = result.canceled
          ? store.execute({ type: 'load' })
          : store.execute({ type: 'importFiles', containerId: command.containerId, paths: result.filePaths });
      } else if (command.type === 'exportItem') {
        const file = await Effect.runPromise(store.fileForItem(command.id));
        const result = await dialog.showSaveDialog(window, { title: 'Save a copy', defaultPath: file.item.name });

        if (!result.canceled && result.filePath) {
          await copyFile(file.path, result.filePath);
        }

        operation = store.execute({ type: 'load' });
      } else {
        operation = store.execute(command);
      }

      const outcome = await Effect.runPromise(operation.pipe(Effect.result));

      if (Result.isFailure(outcome)) {
        throw outcome.failure;
      }

      const value = outcome.success;

      if (command.type !== 'load' && command.type !== 'exportItem') {
        notify();
      }

      return { ok: true, value };
    } catch (cause) {
      return {
        ok: false,
        error: cause instanceof WorkspaceError ? cause.message : 'The file action could not be completed. Please try again.',
      };
    }
  });

  ipcMain.on('workspace:drag', (event, input: unknown) => {
    assertSender(event);

    if (typeof input !== 'string') {
      return;
    }

    void Effect.runPromise(store.fileForItem(input))
      .then(({ path }) => {
        if (!event.sender.isDestroyed()) {
          event.sender.startDrag({ file: path, icon: nativeImage.createFromPath(dragIconPath).resize({ width: 32, height: 32 }) });
        }
      })
      .catch(() => event.sender.send('workspace:changed'));
  });
}
