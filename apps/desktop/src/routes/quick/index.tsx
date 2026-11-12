import { ContainerCreate } from '../../components/container-create';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../components/file-shelf';
import { useQuickContainer } from './-utils/container';

export const Route = createFileRoute('/quick/')({ component: QuickFiles });

function QuickFiles() {
  const navigate = Route.useNavigate();
  const { selected } = useQuickContainer();

  if (!selected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h2 className="font-semibold">Your quick-access garage</h2>
        <p className="text-sm text-muted-foreground">Create a container to start collecting files.</p>
        <ContainerCreate
          onCreated={(containerId) => {
            void navigate({ to: '/quick', search: { containerId } });
          }}
        >
          <Button>New container</Button>
        </ContainerCreate>
      </div>
    );
  }

  return <FileShelf containerId={selected.id} showAddButton />;
}
