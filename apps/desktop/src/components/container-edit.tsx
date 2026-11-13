import type { ReactNode } from 'react';
import type { Container } from '@desk-garage/containers';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@desk-garage/ui/dialog';
import { ContainerForm } from './container-form';
import { TriggerDialog, useTriggerDialog } from './trigger-dialog';

export function ContainerEdit({ container, children }: { container: Container; children: ReactNode }) {
  return (
    <TriggerDialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit container</DialogTitle>
          <DialogDescription>Update its name and optional description.</DialogDescription>
        </DialogHeader>
        <EditContainerForm container={container} />
      </DialogContent>
    </TriggerDialog>
  );
}

function EditContainerForm({ container }: { container: Container }) {
  const { isOpen, close } = useTriggerDialog();

  return <ContainerForm key={isOpen ? container.id : 'closed'} variant="dialog" container={container} onCreated={close} />;
}
