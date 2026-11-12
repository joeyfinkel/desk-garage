import { useNavigate } from '@tanstack/react-router';
import { Atom } from 'effect/reactivity';
import { make as makeScopedAtom, useAtom } from '@effect/atom-react';
import { Ellipsis, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import type { Container } from '@desk-garage/containers';
import { Button } from '@desk-garage/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@desk-garage/ui/popover';
import { Separator } from '@desk-garage/ui/separator';
import { useContainerWorkspace } from '../../-utils/containers';
import { ContainerEdit } from '../../../components/container-edit';
import { ContainerDelete } from '../../../components/container-delete';

const openState = makeScopedAtom(() => Atom.make(false));

export function ContainerActions({ container }: { container: Container }) {
  return (
    <openState.Provider>
      <Actions container={container} />
    </openState.Provider>
  );
}

function Actions({ container }: { container: Container }) {
  const [isOpen, setIsOpen] = useAtom(openState.use());
  const { command, isWorking } = useContainerWorkspace();
  const navigate = useNavigate();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Container actions" className="desktop-no-drag shrink-0">
          <Ellipsis />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="desktop-no-drag w-52 p-1"
        aria-label="Container actions"
        onFocusOutside={(event) => {
          if (document.querySelector('[role="dialog"]')) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (event.target instanceof Element && event.target.closest('[role="dialog"], [data-slot="dialog-overlay"]')) {
            event.preventDefault();
          }
        }}
      >
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
        <ContainerEdit container={container}>
          <Button variant="ghost" className="w-full justify-start" disabled={isWorking}>
            <Pencil />
            Edit container
          </Button>
        </ContainerEdit>
        <Separator className="my-1" />
        <ContainerDelete
          container={container}
          onDeleted={() => {
            setIsOpen(false);
            void navigate({ to: '/containers', replace: true });
          }}
        >
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" disabled={isWorking}>
            <Trash2 />
            Delete container
          </Button>
        </ContainerDelete>
      </PopoverContent>
    </Popover>
  );
}
