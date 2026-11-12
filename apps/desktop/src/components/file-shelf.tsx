import { useState } from 'react';
import { FilePlus2, Upload } from 'lucide-react';
import { Button } from '@desk-garage/ui/button';
import { cn } from '@desk-garage/ui/cn';
import { useContainerWorkspace } from '../routes/-utils/containers';
import { FileRow } from './file-row';
import { ScreenMessage, ScreenMessageActions, ScreenMessageDescription, ScreenMessageIcon, ScreenMessageTitle } from './screen-message';

export function FileShelf({ containerId, showAddButton = false }: { containerId: string; showAddButton?: boolean }) {
  const { containers, items, command, importDropped, isWorking } = useContainerWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const name = containers.find((container) => container.id === containerId)?.name;
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
      {files.length > 0 && (
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
      )}
      {isWorking && files.length > 0 && (
        <p role="status" className="text-xs text-muted-foreground">
          Saving changes…
        </p>
      )}
      {files.length ? (
        files.map((item) => <FileRow key={item.id} item={item} />)
      ) : (
        <ScreenMessage>
          <ScreenMessageIcon>
            <Upload className="size-9" />
          </ScreenMessageIcon>
          <ScreenMessageTitle>{name ? `No files in ${name}` : 'No files yet'}</ScreenMessageTitle>
          <ScreenMessageDescription>Drag in the files you want close at hand, from anywhere in your workspace.</ScreenMessageDescription>
          {showAddButton ? (
            <ScreenMessageActions>
              <Button
                disabled={isWorking}
                onClick={() => {
                  void command({ type: 'pickFiles', containerId });
                }}
              >
                <FilePlus2 />
                Add files
              </Button>
            </ScreenMessageActions>
          ) : null}
        </ScreenMessage>
      )}
    </section>
  );
}
