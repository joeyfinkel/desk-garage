import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  leading?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, leading, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4 border-b pb-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">{eyebrow}</div>}
        <div className="flex items-center gap-3">
          {leading}
          <h2 className="truncate text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        {description && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
