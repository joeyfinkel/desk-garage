import { getRouteApi, Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../../../../components/file-shelf';
import { ContainerPage } from '../../-components/page';
import { useContainerWorkspace } from '../../../../-utils/containers';

export function ContainerDetail() {
  const { containerId } = getRouteApi('/_desktop/containers/$containerId').useParams();
  const { containers } = useContainerWorkspace();
  const selected = containers.find((container) => container.id === containerId && !container.deletedAt);

  if (!selected) {
    return (
      <ContainerPage.NotFound
        actions={
          <>
            <Button asChild>
              <Link to="/trash">Look in trash</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/containers">Back to containers</Link>
            </Button>
          </>
        }
      />
    );
  }

  return (
    <ContainerPage summary={selected.description}>
      <FileShelf containerId={selected.id} />
    </ContainerPage>
  );
}
