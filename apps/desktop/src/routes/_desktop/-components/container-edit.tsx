import type { Container } from '@desk-garage/containers';
import { Button } from '@desk-garage/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@desk-garage/ui/dialog';
import { ContainerForm } from '../../../components/container-form';

export function ContainerEdit({ container, onClose }: { container: Container | undefined; onClose: () => void }) {
  return (
    <Dialog
      open={!!container}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit container</DialogTitle>
          <DialogDescription>Update its name and optional description.</DialogDescription>
        </DialogHeader>
        {container && (
          <div>
            <ContainerForm
              key={container.id}
              container={container}
              onCreated={onClose}
              cancel={
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
