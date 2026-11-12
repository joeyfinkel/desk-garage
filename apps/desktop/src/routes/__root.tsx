import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useContainers } from '../use-containers';
import { ContainersContext } from './-utils/containers';
import { NotFound } from './-components/not-found';
import { RouteError } from './-components/route-error';

export const Route = createRootRoute({ component: RootRoute, notFoundComponent: NotFound, errorComponent: RouteError });

function RootRoute() {
  const workspace = useContainers();

  return (
    <ContainersContext.Provider value={workspace}>
      {workspace.storageError && (
        <p role="alert" className="p-4 text-sm text-destructive">
          {workspace.storageError}
        </p>
      )}
      <Outlet />
    </ContainersContext.Provider>
  );
}
