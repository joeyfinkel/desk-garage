import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react';
import type { FileItem } from '@desk-garage/workspace';
import { Button } from '@desk-garage/ui/button';
import { useContainerWorkspace } from '../routes/-utils/containers';
import { FileMark } from './file-mark';
import { FileTypeIcon } from './file-type-icon';

export function FileRow({ item }: { item: FileItem }) {
  if (item.body != null) {
    return <NoteRow item={item} />;
  }

  return <StoredFileRow item={item} />;
}

function StoredFileRow({ item }: { item: FileItem }) {
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
      <FileMark item={item} />
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

function NoteRow({ item }: { item: FileItem }) {
  const { command, isWorking } = useContainerWorkspace();
  const [draft, setDraft] = useState(item.body ?? '');
  const [isCollapsed, setIsCollapsed] = useState(item.body !== '');
  const preview = draft.replace(/\s+/g, ' ').trim();

  useEffect(() => {
    if (draft === (item.body ?? '')) {
      return;
    }

    const handle = setTimeout(() => {
      void command({ type: 'updateNote', id: item.id, body: draft });
    }, 400);

    return () => clearTimeout(handle);
  }, [command, draft, item.body, item.id]);

  return (
    <div
      draggable={!isWorking}
      title="Drag this note to paste its text"
      className="rounded-lg border bg-card p-3"
      onDragStart={(event) => {
        if (event.target instanceof Element && event.target.closest('textarea')) {
          event.preventDefault();

          return;
        }

        event.dataTransfer.setData('text/plain', draft);
        event.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="flex items-center gap-2">
        {isCollapsed ? (
          <>
            <FileTypeIcon label="note" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Note</p>
              <p className="truncate text-sm font-medium">{preview || 'Empty note'}</p>
            </div>
          </>
        ) : (
          <span className="flex-1 text-xs text-muted-foreground">Note</span>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={isCollapsed ? 'Expand note' : 'Collapse note'}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        >
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Delete note"
          disabled={isWorking}
          onClick={() => {
            void command({ type: 'trashItem', id: item.id });
          }}
        >
          <Trash2 />
        </Button>
      </div>
      {!isCollapsed && (
        <textarea
          value={draft}
          autoFocus={item.body === ''}
          aria-label={item.name || 'Note'}
          placeholder="Write something you can drag out and paste"
          className="mt-2 min-h-24 w-full resize-y bg-transparent text-sm outline-none"
          maxLength={20000}
          onChange={(event) => setDraft(event.target.value)}
        />
      )}
    </div>
  );
}
