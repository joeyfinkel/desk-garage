import { Link } from '@tanstack/react-router';
import { Folder, HardDrive, House, Plus, Trash2 } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../-utils/containers';

export function Sidebar() {
  const { containers } = useContainerWorkspace();
  const active = containers.filter((container) => !container.deletedAt);
  const trashCount = containers.filter((container) => container.deletedAt).length;

  return (
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
        <Button variant="ghost" size="icon-xs" asChild>
          <Link to="/containers/new" aria-label="Create container">
            <Plus />
          </Link>
        </Button>
      </div>
      <nav aria-label="Containers" className="space-y-1">
        {active.map((container) => (
          <Button key={container.id} variant="ghost" className="w-full justify-start font-normal" asChild>
            <Link
              to="/containers/$containerId"
              params={{ containerId: container.id }}
              activeProps={{ className: 'bg-accent text-accent-foreground' }}
            >
              <Folder />
              <span className="truncate">{container.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <Button variant="ghost" className="mt-2 justify-start text-muted-foreground" asChild>
        <Link to="/containers/new">
          <Plus />
          New container
        </Link>
      </Button>
      <div className="mt-auto space-y-4 pt-12">
        <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground" asChild>
          <Link to="/trash" activeProps={{ className: 'bg-accent text-accent-foreground' }}>
            <Trash2 />
            Trash<span className="ml-auto text-xs">{trashCount}</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 border-t px-2 pt-4 text-xs text-muted-foreground">
          <HardDrive size={14} />
          Stored on this device
        </div>
      </div>
    </aside>
  );
}
