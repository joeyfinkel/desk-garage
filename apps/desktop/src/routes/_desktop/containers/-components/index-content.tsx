import { ContainerCreate } from '../../../../components/container-create';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { Folder, Plus } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../../../-utils/containers';
import { ScreenMessage, ScreenMessageActions, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from '../../../../components/screen-message';
import { GaragePage } from './page';

export function ContainersIndex() {
  const navigate = useNavigate();
  const { containers } = useContainerWorkspace();
  const first = containers.find((container) => !container.deletedAt);

  if (first) {
    return <Navigate to="/containers/$containerId" params={{ containerId: first.id }} replace />;
  }

  return (
    <GaragePage>
      <ScreenMessage>
        <ScreenMessageIcon>
          <Folder className="size-9" />
        </ScreenMessageIcon>
        <ScreenMessageTitle>No containers yet</ScreenMessageTitle>
        <ScreenMessageDescription>Create one to keep a private set of files on this device.</ScreenMessageDescription>
        <ScreenMessageActions>
          <ContainerCreate
            onCreated={(id) => {
              void navigate({ to: '/containers/$containerId', params: { containerId: id } });
            }}
          >
            <Button>
              <Plus />
              New container
            </Button>
          </ContainerCreate>
        </ScreenMessageActions>
      </ScreenMessage>
    </GaragePage>
  );
}
