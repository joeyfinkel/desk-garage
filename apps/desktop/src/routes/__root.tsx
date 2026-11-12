import { lazy, Suspense } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useContainers } from '../use-containers';
import { ContainersContext } from './-utils/containers';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@desk-garage/ui/sidebar';
import { WorkspaceSidebar } from './-components/sidebar';
import { NotFound } from './-components/not-found';
import { RouteError } from './-components/route-error';

const Devtools = import.meta.env.DEV ? lazy(() => import('./-components/devtools')) : undefined;

export const Route = createRootRoute({ component: RootRoute, notFoundComponent: NotFound, errorComponent: RouteError });

function RootRoute() {
  const workspace = useContainers();

  return (
    <ContainersContext.Provider value={workspace}>
      <div className="desktop-drag-region fixed inset-x-0 top-0 z-50 h-8" />
      <SidebarProvider className="min-h-[calc(100svh-2rem)] pt-8">
        <WorkspaceSidebar />
        <SidebarInset>
          <div className="px-6 pt-2">
            <SidebarTrigger />
          </div>
          {workspace.storageError && (
            <p role="alert" className="px-8 pt-8 text-sm text-destructive">
              {workspace.storageError}
            </p>
          )}
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
    </ContainersContext.Provider>
  );
}
