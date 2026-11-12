import type { ReactNode } from 'react';

export function ScreenMessage({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <div className="text-primary">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="max-w-72 text-sm text-muted-foreground">{description}</p>
      {actions && <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
