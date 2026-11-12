import { FolderOpen } from 'lucide-react';

export function EmptyContainer() {
  return (
    <div className="flex min-h-80 flex-1 flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-10 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border bg-card text-primary shadow-sm">
        <FolderOpen size={28} strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">A little room for your everyday things</h2>
      <p className="mt-2 max-w-72 text-sm leading-6 text-muted-foreground">
        Your files, links, and snippets will live here. This container is private to this device.
      </p>
      <span className="mt-6 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">File import is coming next</span>
    </div>
  );
}
