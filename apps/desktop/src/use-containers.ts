import { useCallback, useEffect, useRef, useState } from 'react';
import { Effect, Result } from 'effect';
import { type Workspace, type WorkspaceCommand, WorkspaceError } from '@desk-garage/workspace';
import { decodeWorkspaceResponse, runWorkspaceCommand } from './services/containers';

const emptyWorkspace: Workspace = { version: 1, revision: -1, containers: [], items: [] };

export function useContainers() {
  const [state, setState] = useState({ workspace: emptyWorkspace, storageError: '', isLoading: true, pending: 0 });
  const isMounted = useRef(true);

  const run = useCallback(async (operation: Effect.Effect<Workspace, WorkspaceError>) => {
    setState((current) => ({ ...current, pending: current.pending + 1 }));
    const result = await Effect.runPromise(operation.pipe(Effect.result));

    if (!isMounted.current) {
      return undefined;
    }

    if (Result.isFailure(result)) {
      setState((current) => ({ ...current, storageError: result.failure.message, isLoading: false, pending: current.pending - 1 }));

      return undefined;
    }

    setState((current) => ({
      workspace: result.success.revision >= current.workspace.revision ? result.success : current.workspace,
      storageError: '',
      isLoading: false,
      pending: current.pending - 1,
    }));

    return result.success;
  }, []);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, isLoading: current.workspace.revision < 0, storageError: '' }));
    const initial = Effect.try({
      try: () => localStorage.getItem('desk-garage:containers:v1'),
      catch: (cause) => new WorkspaceError({ message: 'Existing local containers could not be read for migration.', cause }),
    }).pipe(Effect.flatMap((legacyContainers) => runWorkspaceCommand({ type: 'load', legacyContainers })));

    return run(initial);
  }, [run]);

  useEffect(() => {
    isMounted.current = true;
    void reload();
    const unsubscribe = window.deskGarage?.onChanged(() => {
      void run(runWorkspaceCommand({ type: 'load' }));
    });

    return () => {
      isMounted.current = false;
      unsubscribe?.();
    };
  }, [reload, run]);

  function command(command: WorkspaceCommand) {
    return run(runWorkspaceCommand(command));
  }

  async function addContainer(name: string, description?: string) {
    const next = await command({ type: 'createContainer', name, description });

    return next?.containers.at(-1)?.id;
  }

  async function trashContainer(id: string) {
    return !!(await command({ type: 'trashContainer', id }));
  }

  function restoreContainer(id: string) {
    return command({ type: 'restoreContainer', id });
  }

  function importDropped(containerId: string, files: File[]) {
    const operation = Effect.tryPromise({
      try: async () => {
        if (!window.deskGarage) {
          throw new Error('The desktop connection is unavailable.');
        }

        return window.deskGarage.importDropped(containerId, files);
      },
      catch: (cause) => new WorkspaceError({ message: 'These files could not be imported. Please try the file picker.', cause }),
    }).pipe(Effect.flatMap(decodeWorkspaceResponse));

    return run(operation);
  }

  return {
    containers: state.workspace.containers,
    items: state.workspace.items,
    storageError: state.storageError,
    isLoading: state.isLoading,
    hasLoaded: state.workspace.revision >= 0,
    reload,
    isWorking: state.pending > 0,
    addContainer,
    trashContainer,
    restoreContainer,
    command,
    importDropped,
  };
}
