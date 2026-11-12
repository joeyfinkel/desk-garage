import { lazy, Suspense } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useContainers } from '../use-containers';
import { ContainersContext } from './-utils/containers';
import { Sidebar } from './-components/sidebar';
import { NotFound } from './-components/not-found';
import { RouteError } from './-components/route-error';

const Devtools = import.meta.env.DEV ? lazy(() => import('./-components/devtools')) : undefined;

export const Route = createRootRoute({ component: RootRoute, notFoundComponent: NotFound, errorComponent: RouteError });

function RootRoute() {
  const workspace = useContainers();

  return (
    <ContainersContext.Provider value={workspace}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {workspace.storageError && (
            <p role="alert" className="px-8 pt-8 text-sm text-destructive">
              {workspace.storageError}
            </p>
          )}
          <Outlet />
        </div>
      </div>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
    </ContainersContext.Provider>
  );
}
