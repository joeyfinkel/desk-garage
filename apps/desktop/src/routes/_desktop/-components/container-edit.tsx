import type { Container } from '@desk-garage/containers';
import { Button } from '@desk-garage/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@desk-garage/ui/sheet';
import { ContainerForm } from '../../../components/container-form';

export function ContainerEdit({ container, onClose }: { container: Container | undefined; onClose: () => void }) {
  return (
    <Sheet
      open={!!container}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit container</SheetTitle>
          <SheetDescription>Update its name and optional description.</SheetDescription>
        </SheetHeader>
        {container && (
          <div className="p-4">
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
      </SheetContent>
    </Sheet>
  );
}
