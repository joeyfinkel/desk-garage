import * as React from 'react';
import { cn } from '@desk-garage/ui/cn';
import { Input } from '@desk-garage/ui/input';

export function SidebarInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input data-slot="sidebar-input" data-sidebar="input" className={cn('h-8 w-full bg-background shadow-none', className)} {...props} />
  );
}
