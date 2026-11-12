import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { Input } from '@desk-garage/ui/input';
import { useContainerWorkspace } from '../../../-utils/containers';

export function CreateContainerForm() {
  const [name, setName] = useState('');
  const { addContainer, isWorking } = useContainerWorkspace();
  const navigate = useNavigate();

  return (
    <form
      className="max-w-md rounded-xl border bg-card p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const id = await addContainer(name);

        if (id) {
          void navigate({ to: '/containers/$containerId', params: { containerId: id }, replace: true });
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
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Only available on this device. You can organize your files here as the garage grows.
      </p>
      <div className="mt-6 flex gap-2">
        <Button type="submit" disabled={!name.trim() || isWorking}>
          <Plus />
          Create container
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/containers">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
