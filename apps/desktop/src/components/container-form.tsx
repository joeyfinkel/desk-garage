import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Container } from '@desk-garage/containers';
import { Plus } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { Input } from '@desk-garage/ui/input';
import { useContainerWorkspace } from '../routes/-utils/containers';

export function ContainerForm({
  onCreated,
  cancel,
  container,
}: {
  onCreated: (id: string) => void;
  cancel: ReactNode;
  container?: Container;
}) {
  const [name, setName] = useState(container?.name ?? '');
  const [description, setDescription] = useState(container?.description ?? '');
  const { addContainer, command, isWorking } = useContainerWorkspace();

  return (
    <form
      className="max-w-md rounded-xl border bg-card p-6"
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
      <label htmlFor="container-name" className="text-sm font-medium">
        Container name
      </label>
      <Input
        id="container-name"
        className="mt-3"
        placeholder="e.g. Work essentials"
        value={name}
        maxLength={80}
        autoFocus
        required
        onChange={(event) => setName(event.target.value)}
      />
      <label htmlFor="container-description" className="mt-5 block text-sm font-medium">
        Description <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      <textarea
        id="container-description"
        className="mt-2 min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={description}
        maxLength={1000}
        placeholder="What do you keep here?"
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={!name.trim() || isWorking}>
          {!container && <Plus />}
          {container ? 'Save changes' : 'Create container'}
        </Button>
        {cancel}
      </div>
    </form>
  );
}
