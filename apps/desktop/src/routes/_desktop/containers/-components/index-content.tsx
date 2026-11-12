import { Link, Navigate } from '@tanstack/react-router';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../../../-utils/containers';
import { GaragePage } from './page';

export function ContainersIndex() {
  const { containers } = useContainerWorkspace();
  const first = containers.find((container) => !container.deletedAt);

  if (first) {
    return <Navigate to="/containers/$containerId" params={{ containerId: first.id }} replace />;
  }

  return (
    <GaragePage>
      <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed">
        <Folder size={30} className="text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Create a container to get started.</p>
        <Button className="mt-5" asChild>
          <Link to="/containers/new">
            <Plus />
            New container
          </Link>
        </Button>
      </div>
    </GaragePage>
  );
}
