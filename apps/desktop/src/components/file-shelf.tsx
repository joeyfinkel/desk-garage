import { useState } from 'react';
import { FilePlus2, Upload } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { cn } from '@desk-garage/ui/cn';
import { useContainerWorkspace } from '../routes/-utils/containers';
import { FileRow } from './file-row';

export function FileShelf({ containerId, showAddButton = false }: { containerId: string; showAddButton?: boolean }) {
  const { items, command, importDropped, isWorking } = useContainerWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const files = items.filter((item) => item.containerId === containerId && !item.deletedAt);

  return (
    <section
      aria-label="Container files"
      className={cn(
        'flex min-h-64 flex-1 flex-col gap-3',
        isDragging && 'bg-accent outline-2 outline-dashed outline-primary outline-offset-4',
      )}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) {
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);

        if (!isWorking) {
          void importDropped(containerId, Array.from(event.dataTransfer.files));
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
        {showAddButton && (
          <Button
            size="sm"
            disabled={isWorking}
            onClick={() => {
              void command({ type: 'pickFiles', containerId });
            }}
          >
            <FilePlus2 />
            Add files
          </Button>
        )}
      </div>
      {isWorking && (
        <p role="status" className="text-xs text-muted-foreground">
          Saving changes…
        </p>
      )}
      {files.length ? (
        files.map((item) => <FileRow key={item.id} item={item} />)
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
          <Upload className="size-9 text-primary" />
          <h3 className="font-semibold">Drop your everyday files here</h3>
          <p className="max-w-72 text-sm text-muted-foreground">
            DeskGarage keeps its own copy. Moving or deleting the original won't affect it.
          </p>
        </div>
      )}
    </section>
  );
}
