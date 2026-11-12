import { ContainerCreate } from '../../components/container-create';
import { createFileRoute } from '@tanstack/react-router';
import { Folder } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { FileShelf } from '../../components/file-shelf';
import { ScreenMessage, ScreenMessageActions, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from '../../components/screen-message';
import { useQuickContainer } from './-utils/container';

export const Route = createFileRoute('/quick/')({ component: QuickFiles });

function QuickFiles() {
  const navigate = Route.useNavigate();
  const { selected } = useQuickContainer();

  if (!selected) {
    return (
      <ScreenMessage>
        <ScreenMessageIcon>
          <Folder className="size-9" />
        </ScreenMessageIcon>
        <ScreenMessageTitle>No containers yet</ScreenMessageTitle>
        <ScreenMessageDescription>Create one to keep a private set of files on this device.</ScreenMessageDescription>
        <ScreenMessageActions>
          <ContainerCreate
            onCreated={(containerId) => {
              void navigate({ to: '/quick', search: { containerId } });
            }}
          >
            <Button>New container</Button>
          </ContainerCreate>
        </ScreenMessageActions>
      </ScreenMessage>
    );
  }

  return <FileShelf containerId={selected.id} showAddButton />;
}
