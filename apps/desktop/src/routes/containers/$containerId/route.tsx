import { createFileRoute, Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { EmptyContainer } from './-components/empty';
import { ContainersPage } from '../-components/page';
import { useContainerWorkspace } from '../../-utils/containers';

export const Route = createFileRoute('/containers/$containerId')({ component: ContainerDetail });

function ContainerDetail() {
  const { containerId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { containers, trashContainer } = useContainerWorkspace();
  const selected = containers.find((container) => container.id === containerId && !container.deletedAt);

  if (!selected) {
    return (
      <ContainersPage title="Container unavailable">
        <p className="text-sm text-muted-foreground">This container does not exist or is in the trash.</p>
        <Button asChild className="mt-5 self-start">
          <Link to="/trash">Look in trash</Link>
        </Button>
        <Button asChild variant="link" className="mt-2 self-start">
          <Link to="/containers">Back to containers</Link>
        </Button>
      </ContainersPage>
    );
  }

  return (
    <ContainersPage
      title={selected.name}
      actions={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Move container to trash"
          onClick={() => {
            if (trashContainer(selected.id)) {
              void navigate({ to: '/containers', replace: true });
            }
          }}
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      }
    >
      <EmptyContainer />
    </ContainersPage>
  );
}
