import { createFileRoute, Link } from '@tanstack/react-router';
import { CreateContainerPage } from './-components/page';
import { ContainerForm } from '../../../../components/container-form';
import { Button } from '@desk-garage/ui/button';

export const Route = createFileRoute('/_desktop/containers/new')({ component: CreateContainer });

function CreateContainer() {
  const navigate = Route.useNavigate();

  return (
    <CreateContainerPage title="New container">
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
