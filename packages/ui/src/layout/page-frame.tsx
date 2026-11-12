import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function PageFrame({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex min-w-0 flex-1 flex-col p-8', className)} {...props} />;
}
