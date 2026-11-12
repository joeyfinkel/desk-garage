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
      <Outlet />
    </ContainersContext.Provider>
  );
}
