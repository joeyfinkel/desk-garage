import { BrowserWindow, dialog, ipcMain, nativeImage, type NativeImage } from 'electron';
import { copyFile, writeFile } from 'node:fs/promises';
import { Effect, Result, Schema } from 'effect';
import { WorkspaceCommand, WorkspaceError, type WorkspaceResponse } from '@desk-garage/workspace';
import { getTrustedWindow } from '../trusted-window';
import { renderFileTypeIconPng } from './file-type-drag-icon';
import { fileTypeLabel } from '../../src/file-type-icon-svg';
import type { createWorkspaceStore } from './store';

const dragIcons = new Map<string, NativeImage>();

function dragIcon(name: string) {
  const label = fileTypeLabel(name);
  const cached = dragIcons.get(label);

  if (cached) {
    return cached;
  }

  const icon = nativeImage.createFromBuffer(renderFileTypeIconPng(name), { scaleFactor: 2 });
  dragIcons.set(label, icon);

  return icon;
}

export function registerWorkspaceIpc(store: ReturnType<typeof createWorkspaceStore>) {
  const dialogs = new Set<number>();

  function withDialog<A>(window: BrowserWindow, action: () => Promise<A>) {
    dialogs.add(window.id);

    return action().finally(() => {
      dialogs.delete(window.id);

      if (!window.isDestroyed()) {
        window.show();
        window.focus();
      }
    });
  }

  function notify() {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('workspace:changed');
    }
  }

  ipcMain.handle('workspace:command', async (event, input: unknown): Promise<WorkspaceResponse> => {
    try {
      const window = getTrustedWindow(event);
      const command = await Effect.runPromise(
        Schema.decodeUnknownEffect(WorkspaceCommand)(input).pipe(
          Effect.mapError((cause) => new WorkspaceError({ message: 'This action is not available. Restart DeskGarage and try again.', cause })),
        ),
      );
      let operation;

      if (command.type === 'pickFiles') {
        const result = await withDialog(window, () =>
          dialog.showOpenDialog(window, {
            title: 'Add files to DeskGarage',
            properties: ['openFile', 'multiSelections'],
          }),
        );
        operation = result.canceled
          ? store.execute({ type: 'load' })
          : store.execute({ type: 'importFiles', containerId: command.containerId, paths: result.filePaths });
      } else if (command.type === 'exportItem') {
        const file = await Effect.runPromise(store.fileForItem(command.id));
        const result = await withDialog(window, () => dialog.showSaveDialog(window, { title: 'Save a copy', defaultPath: file.item.name }));

        if (!result.canceled && result.filePath) {
          if (file.item.body != null) {
            await writeFile(result.filePath, file.item.body);
          } else if (file.path) {
            await copyFile(file.path, result.filePath);
          }
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
    getTrustedWindow(event);

    if (typeof input !== 'string') {
      return;
    }

    void Effect.runPromise(store.fileForItem(input))
      .then(({ item, path }) => {
        if (path && !event.sender.isDestroyed()) {
          event.sender.startDrag({ file: path, icon: dragIcon(item.name) });
        }
      })
      .catch(() => event.sender.send('workspace:changed'));
  });

  return { hasDialog: (window: BrowserWindow) => dialogs.has(window.id) };
}
