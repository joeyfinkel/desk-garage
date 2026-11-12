import { createFileRoute, Link } from '@tanstack/react-router';
import { Archive, ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../-utils/containers';
import { TrashPage } from './-components/page';

export const Route = createFileRoute('/trash')({ component: Trash });

function Trash() {
  const { containers, items, restoreContainer, command, isWorking } = useContainerWorkspace();
  const trashed = containers.filter((container) => container.deletedAt);

  const trashedItems = items.filter(
    (item) => item.deletedAt && containers.some((container) => container.id === item.containerId && !container.deletedAt),
  );

  return (
    <TrashPage title="Trash">
      <div className="space-y-3">
        {trashed.length || trashedItems.length ? (
          <>
            {trashed.map((container) => (
              <div key={container.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <Archive size={19} className="text-muted-foreground" />
                <span className="flex-1 truncate text-sm font-medium">{container.name}</span>
                <Button variant="outline" size="sm" onClick={() => restoreContainer(container.id)}>
                  <RotateCcw />
                  Restore
                </Button>
              </div>
            ))}
            {trashedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
                <Archive size={19} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{containers.find((container) => container.id === item.containerId)?.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isWorking}
                  onClick={() => {
                    void command({ type: 'restoreItem', id: item.id });
                  }}
                >
                  <RotateCcw />
                  Restore file
                </Button>
              </div>
            ))}
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            <Trash2 size={30} strokeWidth={1.5} />
            <p className="mt-4 text-sm">Your trash is empty.</p>
            <Button variant="link" asChild>
              <Link to="/containers">
                <ArrowLeft />
                Back to containers
              </Link>
            </Button>
          </div>
        )}
      </div>
    </TrashPage>
  );
}
