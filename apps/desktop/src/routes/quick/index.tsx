import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../components/file-shelf';
import { useContainerWorkspace } from '../-utils/containers';
import { useQuickContainer } from './-utils/container';

export const Route = createFileRoute('/quick/')({ component: QuickFiles });

function QuickFiles() {
  const { selected } = useQuickContainer();
  const { isLoading } = useContainerWorkspace();

  if (isLoading) {
    return (
      <p role="status" className="p-4 text-sm text-muted-foreground">
        Loading your garage…
      </p>
    );
  }

  if (!selected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-semibold">Your quick-access garage</h2>
        <p className="text-sm text-muted-foreground">Create a container to start collecting files.</p>
        <Button asChild>
          <Link to="/quick/new" search={{}}>
            New container
          </Link>
        </Button>
      </div>
    );
  }

  return <FileShelf containerId={selected.id} showAddButton />;
}
