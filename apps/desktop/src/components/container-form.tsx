import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Container } from '@desk-garage/containers';
import { Atom } from 'effect/reactivity';
import { make as makeScopedAtom, useAtom } from '@effect/atom-react';
import { Plus } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { cn } from '@desk-garage/ui/cn';
import { DialogClose, DialogFooter } from '@desk-garage/ui/dialog';
import { Input } from '@desk-garage/ui/input';
import { useContainerWorkspace } from '../routes/-utils/containers';

const nameState = makeScopedAtom((initial: string) => Atom.make(initial));
const descriptionState = makeScopedAtom((initial: string) => Atom.make(initial));

export function ContainerForm({
  onCreated,
  cancel,
  container,
  variant = 'page',
}: {
  onCreated: (id: string) => void;
  cancel?: ReactNode;
  container?: Container;
  variant?: 'page' | 'dialog';
}) {
  return (
    <nameState.Provider value={container?.name ?? ''}>
      <descriptionState.Provider value={container?.description ?? ''}>
        <ContainerFields onCreated={onCreated} cancel={cancel} container={container} variant={variant} />
      </descriptionState.Provider>
    </nameState.Provider>
  );
}

function ContainerFields({
  onCreated,
  cancel,
  container,
  variant,
}: {
  onCreated: (id: string) => void;
  cancel?: ReactNode;
  container?: Container;
  variant: 'page' | 'dialog';
}) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const descriptionId = `${formId}-description`;
  const [name, setName] = useAtom(nameState.use());
  const [description, setDescription] = useAtom(descriptionState.use());
  const { addContainer, command, isWorking, storageError } = useContainerWorkspace();

  return (
    <form
      className={cn('w-full', variant === 'page' && !container && 'max-w-md')}
      onSubmit={async (event) => {
        event.preventDefault();
        const id = container
          ? (await command({ type: 'updateContainer', id: container.id, name, description })) && container.id
          : await addContainer(name, description);

        if (id) {
          onCreated(id);
        }
      }}
    >
      <label htmlFor={nameId} className="text-sm font-medium">
        Container name
      </label>
      <Input
        id={nameId}
        className="mt-3"
        placeholder="e.g. Work essentials"
        value={name}
        maxLength={80}
        autoFocus
        required
        onChange={(event) => setName(event.target.value)}
      />
      <label htmlFor={descriptionId} className="mt-5 block text-sm font-medium">
        Description <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      <textarea
        id={descriptionId}
        className="mt-2 min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={description}
        maxLength={1000}
        placeholder="What do you keep here?"
        onChange={(event) => setDescription(event.target.value)}
      />
      {storageError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {storageError}
        </p>
      )}
      {variant === 'dialog' ? (
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!name.trim() || isWorking}>
            {!container && <Plus />}
            {container ? 'Save changes' : 'Create container'}
          </Button>
        </DialogFooter>
      ) : (
        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={!name.trim() || isWorking}>
            {!container && <Plus />}
            {container ? 'Save changes' : 'Create container'}
          </Button>
          {cancel}
        </div>
      )}
    </form>
  );
}
