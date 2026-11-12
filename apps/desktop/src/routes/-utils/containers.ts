import { createContext, useContext } from 'react';
import type { useContainers } from '../../use-containers';

export const ContainersContext = createContext<ReturnType<typeof useContainers> | null>(null);

export function useContainerWorkspace() {
  const workspace = useContext(ContainersContext);

  if (!workspace) {
    throw new Error('Container views must be rendered inside the workspace.');
  }

  return workspace;
}
