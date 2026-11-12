import { WorkspaceBoundary } from '../../components/workspace-boundary';
import { lazy, Suspense } from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SidebarInset, SidebarProvider } from '@desk-garage/ui/sidebar';
import { DesktopHeader } from './-components/header';
import { NotFound } from '../-components/not-found';
import { RouteError } from '../-components/route-error';
import { WorkspaceSidebar } from './-components/sidebar';

const Devtools = import.meta.env.DEV ? lazy(() => import('../-components/devtools')) : undefined;

export const Route = createFileRoute('/_desktop')({ component: DesktopLayout, errorComponent: RouteError, notFoundComponent: NotFound });

function DesktopLayout() {
  return (
    <>
      <SidebarProvider
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        className="h-svh min-h-0 flex-col overflow-hidden"
      >
        <DesktopHeader />
        <div className="flex min-h-0 flex-1">
          <WorkspaceSidebar />
          <SidebarInset className="min-h-0 overflow-y-auto">
            <WorkspaceBoundary>
              <Outlet />
            </WorkspaceBoundary>
          </SidebarInset>
        </div>
      </SidebarProvider>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
    </>
  );
}
