import { getRouteApi, Link } from '@tanstack/react-router';
import { CreateContainerPage } from './page';
import { ContainerForm } from '../../../../../components/container-form';
import { Button } from '@desk-garage/ui/button';

export function CreateContainer() {
  const navigate = getRouteApi('/_desktop/containers/new').useNavigate();

  return (
    <CreateContainerPage>
      <ContainerForm
        onCreated={(id) => {
          void navigate({ to: '/containers/$containerId', params: { containerId: id }, replace: true });
        }}
        cancel={
          <Button variant="ghost" asChild>
            <Link to="/containers">Cancel</Link>
          </Button>
        }
      />
    </CreateContainerPage>
  );
}
