import type { ReactNode } from 'react';
import type { Container } from '@desk-garage/containers';
import { Button } from '@desk-garage/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@desk-garage/ui/dialog';
import { useContainerWorkspace } from '../routes/-utils/containers';
import { TriggerDialog, useTriggerDialog } from './trigger-dialog';

export function ContainerDelete({ container, children, onDeleted }: { container: Container; children: ReactNode; onDeleted: () => void }) {
  return (
    <TriggerDialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete container?</DialogTitle>
          <DialogDescription>“{container.name}” and its files will move to Trash. You can restore them later.</DialogDescription>
        </DialogHeader>
        <DeleteActions container={container} onDeleted={onDeleted} />
      </DialogContent>
    </TriggerDialog>
  );
}

function DeleteActions({ container, onDeleted }: { container: Container; onDeleted: () => void }) {
  const { close } = useTriggerDialog();
  const { trashContainer, isWorking, storageError } = useContainerWorkspace();

  return (
    <>
      {storageError && (
        <p role="alert" className="text-sm text-destructive">
          {storageError}
        </p>
      )}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant="destructive"
          disabled={isWorking}
          onClick={async () => {
            if (await trashContainer(container.id)) {
              close();
              onDeleted();
            }
          }}
        >
          Move to trash
        </Button>
      </DialogFooter>
    </>
  );
}
