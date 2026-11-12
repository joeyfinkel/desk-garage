import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../../../components/file-shelf';
import { ContainersPage } from '../-components/page';
import { useContainerWorkspace } from '../../../-utils/containers';

export const Route = createFileRoute('/_desktop/containers/$containerId')({ component: ContainerDetail });

function ContainerDetail() {
  const { containerId } = Route.useParams();
  const { containers, isLoading } = useContainerWorkspace();
  const selected = containers.find((container) => container.id === containerId && !container.deletedAt);

  if (isLoading) {
    return (
      <ContainersPage title="Your garage">
        <p role="status">Loading container…</p>
      </ContainersPage>
    );
  }

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
    <ContainersPage title={selected.name} subtitle={selected.description ?? null}>
      <FileShelf containerId={selected.id} />
    </ContainersPage>
  );
}
