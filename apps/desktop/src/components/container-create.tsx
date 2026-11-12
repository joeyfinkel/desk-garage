import type { ReactNode } from 'react';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@desk-garage/ui/dialog';
import { ContainerForm } from './container-form';
import { TriggerDialog, useTriggerDialog } from './trigger-dialog';

export function ContainerCreate({ children, onCreated }: { children: ReactNode; onCreated: (id: string) => void }) {
  return (
    <TriggerDialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New container</DialogTitle>
          <DialogDescription>Give your container a name and an optional description.</DialogDescription>
        </DialogHeader>
        <CreateContainerForm onCreated={onCreated} />
      </DialogContent>
    </TriggerDialog>
  );
}

function CreateContainerForm({ onCreated }: { onCreated: (id: string) => void }) {
  const { isOpen, close } = useTriggerDialog();

  return (
    <ContainerForm
      key={isOpen ? 'open' : 'closed'}
      variant="dialog"
      onCreated={(id) => {
        close();
        onCreated(id);
      }}
    />
  );
}
