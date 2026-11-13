// @vitest-environment jsdom

import type { FileItem, WorkspaceCommand } from '@desk-garage/workspace';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vite-plus/test';
import { FileRow } from '../src/components/file-row';
import { ContainersContext } from '../src/routes/-utils/containers';
import type { useContainers } from '../src/use-containers';

function note(body: string): FileItem {
  return {
    id: 'note-1',
    containerId: 'everyday',
    name: 'Note',
    size: body.length,
    createdAt: '2026-11-12T00:00:00.000Z',
    deletedAt: null,
    body,
  };
}

function NoteHarness({ item, command }: { item: FileItem; command: (command: WorkspaceCommand) => Promise<void> }) {
  const workspace = { command, isWorking: false } as ReturnType<typeof useContainers>;

  return (
    <ContainersContext.Provider value={workspace}>
      <FileRow item={item} />
    </ContainersContext.Provider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

it('adopts a saved note from the other window instead of writing the stale draft back', async () => {
  vi.useFakeTimers();
  const commands: WorkspaceCommand[] = [];
  const element = document.createElement('div');
  const root = createRoot(element);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  await act(async () => {
    root.render(<NoteHarness item={note('saved')} command={async (command) => void commands.push(command)} />);
  });
  await act(async () => {
    root.render(<NoteHarness item={note('from the other window')} command={async (command) => void commands.push(command)} />);
    await vi.advanceTimersByTimeAsync(400);
  });

  expect(element.textContent).toContain('from the other window');
  expect(commands).toEqual([]);
  await act(async () => root.unmount());
});

it('saves a typed note after the debounce and flushes it when the row unmounts first', async () => {
  vi.useFakeTimers();
  const commands: WorkspaceCommand[] = [];
  const element = document.createElement('div');
  const root = createRoot(element);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  await act(async () => {
    root.render(<NoteHarness item={note('')} command={async (command) => void commands.push(command)} />);
  });
  const textarea = element.querySelector('textarea');

  if (!textarea) {
    throw new Error('The new note did not open an editor');
  }

  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setValue?.call(textarea, 'keep this');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => {
    root.unmount();
  });

  expect(commands).toEqual([{ type: 'updateNote', id: 'note-1', body: 'keep this' }]);
});

it('saves a typed note when the row stays mounted', async () => {
  vi.useFakeTimers();
  const commands: WorkspaceCommand[] = [];
  const element = document.createElement('div');
  const root = createRoot(element);
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  await act(async () => {
    root.render(<NoteHarness item={note('')} command={async (command) => void commands.push(command)} />);
  });
  const textarea = element.querySelector('textarea');

  if (!textarea) {
    throw new Error('The new note did not open an editor');
  }

  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    setValue?.call(textarea, 'hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(400);
  });

  expect(commands).toEqual([{ type: 'updateNote', id: 'note-1', body: 'hello' }]);
  await act(async () => {
    root.render(<NoteHarness item={note('hello')} command={async (command) => void commands.push(command)} />);
  });
  await act(async () => root.unmount());
  expect(commands).toEqual([{ type: 'updateNote', id: 'note-1', body: 'hello' }]);
});
