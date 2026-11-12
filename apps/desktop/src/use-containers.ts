import { useState } from 'react';
import { Result } from 'effect';
import { addContainer as add, loadContainers, restoreContainer as restore, trashContainer as trash } from '@desk-garage/containers';
import { runContainerOperation } from './services/containers';

export function useContainers() {
  const [state, setState] = useState(() => {
    const result = runContainerOperation(loadContainers);

    return Result.match(result, {
      onSuccess: (containers) => ({ containers, storageError: '' }),
      onFailure: (error) => ({ containers: [], storageError: error.message }),
    });
  });

  function addContainer(name: string) {
    const result = runContainerOperation(add(name));

    if (Result.isFailure(result)) {
      setState((current) => ({ ...current, storageError: result.failure.message }));

      return undefined;
    }

    setState({ containers: result.success.containers, storageError: '' });

    return result.success.id;
  }

  function changeContainer(id: string, operation: typeof trash) {
    const result = runContainerOperation(operation(id));

    if (Result.isFailure(result)) {
      setState((current) => ({ ...current, storageError: result.failure.message }));

      return false;
    }

    setState({ containers: result.success, storageError: '' });

    return true;
  }

  function trashContainer(id: string) {
    return changeContainer(id, trash);
  }

  function restoreContainer(id: string) {
    return changeContainer(id, restore);
  }

  return { ...state, addContainer, trashContainer, restoreContainer };
}
