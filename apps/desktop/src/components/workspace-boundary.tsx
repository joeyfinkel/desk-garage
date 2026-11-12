import type { ReactNode } from 'react';
import { Button } from '@desk-garage/ui/button';
import { createResourceLayout } from '../utils/layout/layout';
import { useContainerWorkspace } from '../routes/-utils/containers';

const WorkspacePage = createResourceLayout({ resource: 'workspace', name: 'WorkspacePage', title: 'Your garage' });

export function WorkspaceBoundary({ children }: { children: ReactNode }) {
  const { isLoading, hasLoaded, storageError, reload } = useContainerWorkspace();

  if (isLoading) {
    return <WorkspacePage.Loading />;
  }

  if (!hasLoaded) {
    return (
      <WorkspacePage.Error
        message={storageError}
        actions={
          <Button
            onClick={() => {
              void reload();
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <>
      {storageError && (
        <p role="alert" className="px-6 py-3 text-sm text-destructive">
          {storageError}
        </p>
      )}
      {children}
    </>
  );
}
