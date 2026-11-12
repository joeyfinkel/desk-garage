import { Download, File, Trash2 } from 'lucide-react';
import type { FileItem } from '@desk-garage/workspace';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../routes/-utils/containers';

export function FileRow({ item }: { item: FileItem }) {
  const { command, isWorking } = useContainerWorkspace();
  const size = new Intl.NumberFormat(undefined, {
    style: 'unit',
    unit: item.size < 1024 ? 'byte' : item.size < 1024 * 1024 ? 'kilobyte' : 'megabyte',
    maximumFractionDigits: 1,
  }).format(item.size / (item.size < 1024 ? 1 : item.size < 1024 * 1024 ? 1024 : 1024 * 1024));

  return (
    <div
      draggable={!isWorking}
      onDragStart={(event) => {
        event.preventDefault();
        window.deskGarage?.dragFile(item.id);
      }}
      className="flex items-center gap-3 rounded-lg border bg-card p-3"
      title="Drag this file into another app to export a copy"
    >
      <File className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{size}</p>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Save a copy of ${item.name}`}
        disabled={isWorking}
        onClick={() => {
          void command({ type: 'exportItem', id: item.id });
        }}
      >
        <Download />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label={`Move ${item.name} to trash`}
        disabled={isWorking}
        onClick={() => {
          void command({ type: 'trashItem', id: item.id });
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
