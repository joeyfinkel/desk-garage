// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vite-plus/test';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Effect, Result } from 'effect';
import type { DesktopBridge, WorkspaceResponse } from '@desk-garage/workspace';
import { createWorkspaceStore } from '../electron/workspace/store';
import { useContainers } from '../src/use-containers';

function WorkspaceProbe({ report }: { report: (workspace: ReturnType<typeof useContainers>) => void }) {
  const workspace = useContainers();
  report(workspace);

  return <span>{workspace.containers.map((container) => container.name).join(', ')}</span>;
}

afterEach(() => {
  delete window.deskGarage;
  vi.unstubAllGlobals();
});

it('keeps independent full and quick UI instances synchronized through native notifications', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'desk-garage-sync-'));
  const store = createWorkspaceStore(directory);
  const listeners = new Set<() => void>();
  const bridge: DesktopBridge = {
    command: async (command): Promise<WorkspaceResponse> => {
      const result = await Effect.runPromise(store.execute(command).pipe(Effect.result));

      if (Result.isFailure(result)) {
        return { ok: false, error: result.failure.message };
      }

      if (command.type !== 'load') {
        listeners.forEach((listener) => listener());
      }

      return { ok: true, value: result.success };
    },
    importDropped: async () => ({ ok: false, error: 'Not used by this test' }),
    onChanged: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    dragFile: () => {},
    openMain: async () => {},
    hideQuick: () => {},
  };
  window.deskGarage = bridge;
  localStorage.clear();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const fullElement = document.createElement('div');
  const quickElement = document.createElement('div');
  const fullRoot = createRoot(fullElement);
  const quickRoot = createRoot(quickElement);
  let panel: ReturnType<typeof useContainers> | undefined;

  try {
    await act(async () => {
      fullRoot.render(<WorkspaceProbe report={() => {}} />);
      quickRoot.render(
        <WorkspaceProbe
          report={(workspace) => {
            panel = workspace;
          }}
        />,
      );
    });
    await act(async () => {
      await bridge.command({ type: 'load' });
    });
    await act(async () => {
      if (!panel) {
        throw new Error('Quick workspace did not mount');
      }

      await panel.addContainer('From quick access');
      // The native semaphore makes this read a barrier after both notification reloads.
      await bridge.command({ type: 'load' });
    });
    expect(fullElement.textContent).toContain('From quick access');
    expect(quickElement.textContent).toContain('From quick access');
  } finally {
    await act(async () => {
      fullRoot.unmount();
      quickRoot.unmount();
    });
    expect(listeners.size).toBe(0);
    await rm(directory, { recursive: true, force: true });
  }
});
