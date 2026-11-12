import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />;
}
