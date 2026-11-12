import { useState, type ReactNode } from 'react';
import { Folder, RotateCcw, Trash2 } from 'lucide-react';
import type { Container } from '@desk-garage/containers';
import type { FileItem } from '@desk-garage/workspace';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../routes/-utils/containers';
import { FileMark } from './file-mark';
import { FileTypeIcon } from './file-type-icon';
import { ScreenMessage, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from './screen-message';

const filters = ['All', 'Files', 'Notes', 'Containers'] as const;
type TrashFilter = (typeof filters)[number];

export function TrashList() {
  const { containers, items, restoreContainer, command, isWorking } = useContainerWorkspace();
  const [filter, setFilter] = useState<TrashFilter>('All');
  const trashed = containers.filter((container) => container.deletedAt);
  const trashedItems = items.filter(
    (item) => item.deletedAt && containers.some((container) => container.id === item.containerId && !container.deletedAt),
  );
  const notes = trashedItems.filter((item) => item.body != null);
  const files = trashedItems.filter((item) => item.body == null);
  const visibleContainers = filter === 'All' || filter === 'Containers' ? trashed : [];
  const visibleItems = filter === 'Files' ? files : filter === 'Notes' ? notes : filter === 'All' ? trashedItems : [];
  const counts = { All: trashed.length + trashedItems.length, Files: files.length, Notes: notes.length, Containers: trashed.length };

  if (!trashed.length && !trashedItems.length) {
    return (
      <ScreenMessage>
        <ScreenMessageIcon>
          <Trash2 className="size-9" />
        </ScreenMessageIcon>
        <ScreenMessageTitle>Trash is empty</ScreenMessageTitle>
        <ScreenMessageDescription>Deleted containers, files, and notes stay here until you restore them.</ScreenMessageDescription>
      </ScreenMessage>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Filter trash">
        {filters.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={filter === option ? 'default' : 'outline'}
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option}
            <span className="text-xs opacity-70">{counts[option]}</span>
          </Button>
        ))}
      </div>
      {visibleContainers.length || visibleItems.length ? (
        <>
          {visibleContainers.map((container) => (
            <TrashRow
              key={container.id}
              title={container.name}
              crumbs={['Container']}
              mark={
                <span className="flex size-8 shrink-0 items-center justify-center text-primary">
                  <Folder className="size-5" />
                </span>
              }
              restoreLabel={`Restore ${container.name}`}
              disabled={isWorking}
              onRestore={() => restoreContainer(container.id)}
            />
          ))}
          {visibleItems.map((item) => (
            <TrashedItem
              key={item.id}
              item={item}
              containers={containers}
              disabled={isWorking}
              onRestore={() => void command({ type: 'restoreItem', id: item.id })}
            />
          ))}
        </>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing in this filter.</p>
      )}
    </div>
  );
}

function TrashedItem({
  item,
  containers,
  disabled,
  onRestore,
}: {
  item: FileItem;
  containers: ReadonlyArray<Container>;
  disabled: boolean;
  onRestore: () => void;
}) {
  const container = containers.find((entry) => entry.id === item.containerId)?.name ?? 'Container';
  const isNote = item.body != null;

  return (
    <TrashRow
      title={item.name}
      crumbs={[isNote ? 'Note' : 'File', container, item.name]}
      mark={isNote ? <FileTypeIcon label="note" /> : <FileMark item={item} />}
      restoreLabel={`Restore ${item.name}`}
      disabled={disabled}
      onRestore={onRestore}
    />
  );
}

function TrashRow({
  title,
  crumbs,
  mark,
  restoreLabel,
  disabled,
  onRestore,
}: {
  title: string;
  crumbs: ReadonlyArray<string>;
  mark: ReactNode;
  restoreLabel: string;
  disabled: boolean;
  onRestore: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      {mark}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{crumbs.join(' > ')}</p>
      </div>
      <Button size="icon-sm" variant="ghost" aria-label={restoreLabel} disabled={disabled} onClick={onRestore}>
        <RotateCcw />
      </Button>
    </div>
  );
}
