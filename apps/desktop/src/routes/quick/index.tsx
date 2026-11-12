import { ContainerCreate } from '../../components/container-create';
import { createFileRoute } from '@tanstack/react-router';
import { Folder } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../components/file-shelf';
import { ScreenMessage } from '../../components/screen-message';
import { useQuickContainer } from './-utils/container';

export const Route = createFileRoute('/quick/')({ component: QuickFiles });

function QuickFiles() {
  const navigate = Route.useNavigate();
  const { selected } = useQuickContainer();

  if (!selected) {
    return (
      <ScreenMessage
        icon={<Folder className="size-9" />}
        title="No containers yet"
        description="Create one to keep a private set of files on this device."
        actions={
          <ContainerCreate
            onCreated={(containerId) => {
              void navigate({ to: '/quick', search: { containerId } });
            }}
          >
            <Button>New container</Button>
          </ContainerCreate>
        }
      />
    );
  }

  return <FileShelf containerId={selected.id} showAddButton />;
}
