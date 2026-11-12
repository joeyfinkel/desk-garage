import * as React from 'react';
import { cn } from '@desk-garage/ui/cn';
import { Separator } from '@desk-garage/ui/separator';

export function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  );
}
