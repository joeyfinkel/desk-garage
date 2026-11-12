import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Expand, House, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@desk-garage/ui/select';
import { useContainerWorkspace } from '../-utils/containers';
import { useQuickContainer } from './-utils/container';

export const Route = createFileRoute('/quick')({
  validateSearch: (search: Record<string, unknown>) => (typeof search.containerId === 'string' ? { containerId: search.containerId } : {}),
  component: QuickLayout,
});

function QuickLayout() {
  const { selected, active } = useQuickContainer();
  const { trashContainer, isWorking } = useContainerWorkspace();
  const navigate = Route.useNavigate();

  return (
    <div
      className="flex h-svh flex-col overflow-hidden"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => event.preventDefault()}
    >
      <header className="flex shrink-0 items-center gap-2 border-b p-3">
        <House className="size-5 text-primary" />
        <span className="flex-1 text-sm font-semibold">DeskGarage</span>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Open full window"
          onClick={() => {
            void window.deskGarage?.openMain(selected?.id);
          }}
        >
          <Expand />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Close quick access" onClick={() => window.deskGarage?.hideQuick()}>
          <X />
        </Button>
      </header>
      <div className="flex shrink-0 items-center gap-2 border-b p-3">
        <Select
          value={selected?.id ?? ''}
          onValueChange={(containerId) => {
            void navigate({ to: '/quick', search: { containerId } });
          }}
          disabled={!active.length}
        >
          <SelectTrigger className="min-w-0 flex-1" aria-label="Choose container">
            <SelectValue placeholder="No containers yet" />
          </SelectTrigger>
          <SelectContent>
            {active.map((container) => (
              <SelectItem key={container.id} value={container.id}>
                {container.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" asChild>
          <Link to="/quick/new" search={{ containerId: selected?.id }} aria-label="Create container">
            <Plus />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          disabled={!selected || isWorking}
          aria-label="Remove current container"
          onClick={() => {
            if (selected) {
              void trashContainer(selected.id);
            }
          }}
        >
          <Trash2 />
        </Button>
      </div>
      <nav className="flex shrink-0 gap-2 px-3 pt-3" aria-label="Quick access views">
        <Button size="sm" variant="ghost" asChild>
          <Link to="/quick" search={{ containerId: selected?.id }} activeOptions={{ exact: true }} activeProps={{ className: 'bg-accent' }}>
            Files
          </Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/quick/trash" search={{ containerId: selected?.id }} activeProps={{ className: 'bg-accent' }}>
            Trash
          </Link>
        </Button>
      </nav>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
        <Outlet />
      </main>
      <footer className="shrink-0 border-t px-3 py-2 text-[11px] text-muted-foreground">
        Private to this device · Changes are saved automatically
      </footer>
    </div>
  );
}
