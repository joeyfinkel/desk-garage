import { cn } from '@desk-garage/ui/cn';

const sidebar = [
  { name: 'Everyday', selected: true },
  { name: 'Reference', selected: false },
  { name: 'Trash', selected: false },
];

const rows = [
  { name: 'contract.pdf', detail: '240 KB' },
  { name: 'headshot.png', detail: '1.8 MB' },
  { name: 'Note', detail: 'Send the revised pages today.' },
];

export function WindowPreview() {
  return (
    <figure
      className="overflow-hidden rounded-2xl border bg-background shadow-sm"
      aria-label="DeskGarage, with quick access in the menu bar"
    >
      <div className="flex items-center justify-end border-b bg-secondary/70 px-3 py-1.5">
        <img src="/icon.svg" alt="" className="size-4" />
      </div>
      <div className="grid min-h-80 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-1 border-b bg-card p-3 sm:border-r sm:border-b-0">
          <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Containers</p>
          {sidebar.map((item) => (
            <div
              key={item.name}
              className={cn('px-2 py-1.5 text-sm', item.selected ? 'rounded-md bg-accent text-accent-foreground' : 'text-muted-foreground')}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="text-sm font-medium">Everyday</p>
            <p className="text-xs text-muted-foreground">Drag in the files you want close at hand.</p>
          </div>
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
              <span className="size-8 shrink-0 rounded-md bg-muted" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{row.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{row.detail}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
