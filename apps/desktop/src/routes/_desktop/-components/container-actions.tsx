import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Ellipsis, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import type { Container } from '@desk-garage/containers';
import { Button } from '@desk-garage/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@desk-garage/ui/popover';
import { Separator } from '@desk-garage/ui/separator';
import { useContainerWorkspace } from '../../-utils/containers';
import { ContainerEdit } from './container-edit';

export function ContainerActions({ container }: { container: Container }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { command, trashContainer, isWorking } = useContainerWorkspace();
  const navigate = useNavigate();

  return (
    <>
      <ContainerEdit container={isEditing ? container : undefined} onClose={() => setIsEditing(false)} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Container actions" className="desktop-no-drag shrink-0">
            <Ellipsis />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="desktop-no-drag w-52 p-1" aria-label="Container actions">
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled={isWorking}
            onClick={() => {
              setIsOpen(false);
              void command({ type: 'pickFiles', containerId: container.id });
            }}
          >
            <FilePlus2 />
            Add file
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            disabled={isWorking}
            onClick={() => {
              setIsOpen(false);
              setIsEditing(true);
            }}
          >
            <Pencil />
            Edit container
          </Button>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            disabled={isWorking}
            onClick={async () => {
              setIsOpen(false);

              if (await trashContainer(container.id)) {
                void navigate({ to: '/containers', replace: true });
              }
            }}
          >
            <Trash2 />
            Delete container
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}
