import { useState } from 'react';

import { Archive, ArrowLeft, Folder, HardDrive, House, LockKeyhole, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { Button } from '@desk-garage/ui/button';

import { Input } from '@desk-garage/ui/input';

import { cn } from '@desk-garage/ui/cn';

import { EmptyContainer } from './components/empty-container';

import { useContainers } from './use-containers';

export function App() {
  const { containers, addContainer, trashContainer, restoreContainer, storageError } = useContainers();
  const [selectedId, setSelectedId] = useState('everyday');
  const [isTrash, setIsTrash] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const active = containers.filter((container) => !container.deletedAt);
  const trashed = containers.filter((container) => container.deletedAt);
  const selected = active.find((container) => container.id === selectedId) ?? active[0];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card/60 px-4 py-7">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <House size={21} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">DeskGarage</h1>
            <p className="text-xs text-muted-foreground">A place for useful things.</p>
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Private containers</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Create container"
            onClick={() => {
              setIsCreating(true);
              setIsTrash(false);
            }}
          >
            <Plus />
          </Button>
        </div>
        <nav aria-label="Containers" className="space-y-1">
          {active.map((container) => (
            <Button
              key={container.id}
              variant="ghost"
              className={cn(
                'w-full justify-start font-normal',
                !isTrash && selected?.id === container.id && 'bg-accent text-accent-foreground',
              )}
              onClick={() => {
                setSelectedId(container.id);
                setIsTrash(false);
                setIsCreating(false);
              }}
            >
              <Folder />
              <span className="truncate">{container.name}</span>
            </Button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-2 justify-start text-muted-foreground"
          onClick={() => {
            setIsCreating(true);
            setIsTrash(false);
          }}
        >
          <Plus />
          New container
        </Button>
        <div className="mt-auto space-y-4 pt-12">
          <Button
            variant="ghost"
            className={cn('w-full justify-start font-normal text-muted-foreground', isTrash && 'bg-accent text-accent-foreground')}
            onClick={() => {
              setIsTrash(true);
              setIsCreating(false);
            }}
          >
            <Trash2 />
            Trash<span className="ml-auto text-xs">{trashed.length}</span>
          </Button>
          <div className="flex items-center gap-2 border-t px-2 pt-4 text-xs text-muted-foreground">
            <HardDrive size={14} />
            Stored on this device
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col p-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <LockKeyhole size={12} />
              Private workspace
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {isCreating ? 'New container' : isTrash ? 'Trash' : (selected?.name ?? 'Your garage')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isTrash ? 'Recover containers you have removed.' : 'Keep the things you reach for close at hand.'}
            </p>
          </div>
          {!isTrash && !isCreating && selected && (
            <Button variant="ghost" size="icon" aria-label="Move container to trash" onClick={() => trashContainer(selected.id)}>
              <Trash2 className="text-muted-foreground" />
            </Button>
          )}
        </header>
        {storageError && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {storageError}
          </p>
        )}
        {isCreating ? (
          <form
            className="max-w-md rounded-xl border bg-card p-6"
            onSubmit={(event) => {
              event.preventDefault();

              if (name.trim()) {
                setSelectedId(addContainer(name));
                setName('');
                setIsCreating(false);
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
              <Button type="submit" disabled={!name.trim()}>
                <Plus />
                Create container
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : isTrash ? (
          <div className="space-y-3">
            {trashed.length ? (
              trashed.map((container) => (
                <div key={container.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                  <Archive size={19} className="text-muted-foreground" />
                  <span className="flex-1 truncate text-sm font-medium">{container.name}</span>
                  <Button variant="outline" size="sm" onClick={() => restoreContainer(container.id)}>
                    <RotateCcw />
                    Restore
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                <Trash2 size={30} strokeWidth={1.5} />
                <p className="mt-4 text-sm">Your trash is empty.</p>
                <Button variant="link" onClick={() => setIsTrash(false)}>
                  <ArrowLeft />
                  Back to containers
                </Button>
              </div>
            )}
          </div>
        ) : selected ? (
          <EmptyContainer />
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed">
            <Folder size={30} className="text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Create a container to get started.</p>
            <Button className="mt-5" onClick={() => setIsCreating(true)}>
              <Plus />
              New container
            </Button>
          </div>
        )}
        <footer className="mt-6 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>DESKGARAGE · EARLY PREVIEW</span>
          <span>Private by default. Yours to keep.</span>
        </footer>
      </main>
    </div>
  );
}
