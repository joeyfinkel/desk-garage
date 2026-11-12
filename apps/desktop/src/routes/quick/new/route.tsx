import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@desk-garage/ui/button';
import { ContainerForm } from '../../../components/container-form';

export const Route = createFileRoute('/quick/new')({ component: QuickCreateContainer });

function QuickCreateContainer() {
  const navigate = Route.useNavigate();
  const { containerId } = Route.useSearch();

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">New container</h2>
      <ContainerForm
        onCreated={(containerId) => {
          void navigate({ to: '/quick', search: { containerId }, replace: true });
        }}
        cancel={
          <Button variant="ghost" asChild>
            <Link to="/quick" search={{ containerId }}>
              Cancel
            </Link>
          </Button>
        }
      />
    </div>
  );
}
